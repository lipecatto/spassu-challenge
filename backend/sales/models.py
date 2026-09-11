from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class Client(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    class Meta:
        ordering = ['name']
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'

    def __str__(self):
        return self.name


class Seller(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    class Meta:
        ordering = ['name']
        verbose_name = 'Vendedor'
        verbose_name_plural = 'Vendedores'

    def __str__(self):
        return self.name


class Product(models.Model):
    code = models.CharField(max_length=30, unique=True)
    description = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    commission_percentage = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('10'))],
        help_text='Percentual de comissão do produto (0 a 10).',
    )

    class Meta:
        ordering = ['code']
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'

    def __str__(self):
        return f'{self.code} - {self.description}'


class CommissionRule(models.Model):
    """Limites min/max de comissão aplicados às vendas feitas em um dia da semana."""

    class Weekday(models.IntegerChoices):
        MONDAY = 0, 'Segunda-feira'
        TUESDAY = 1, 'Terça-feira'
        WEDNESDAY = 2, 'Quarta-feira'
        THURSDAY = 3, 'Quinta-feira'
        FRIDAY = 4, 'Sexta-feira'
        SATURDAY = 5, 'Sábado'
        SUNDAY = 6, 'Domingo'

    weekday = models.IntegerField(choices=Weekday.choices, unique=True)
    min_percentage = models.DecimalField(
        max_digits=4, decimal_places=2,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('10'))],
    )
    max_percentage = models.DecimalField(
        max_digits=4, decimal_places=2,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('10'))],
    )

    class Meta:
        ordering = ['weekday']
        verbose_name = 'Regra de Comissão'
        verbose_name_plural = 'Regras de Comissão'

    def __str__(self):
        return f'{self.get_weekday_display()}: {self.min_percentage}% - {self.max_percentage}%'

    def clamp(self, percentage: Decimal) -> Decimal:
        return max(self.min_percentage, min(self.max_percentage, percentage))


class Sale(models.Model):
    invoice_number = models.CharField(max_length=30, unique=True)
    date_time = models.DateTimeField(default=timezone.now)
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='sales')
    seller = models.ForeignKey(Seller, on_delete=models.PROTECT, related_name='sales')

    class Meta:
        ordering = ['-date_time']
        verbose_name = 'Venda'
        verbose_name_plural = 'Vendas'

    def __str__(self):
        return f'NF {self.invoice_number}'

    @property
    def total_amount(self) -> Decimal:
        return sum((item.total_amount for item in self.items.all()), Decimal('0'))

    @property
    def total_commission(self) -> Decimal:
        return sum((item.commission_amount for item in self.items.all()), Decimal('0'))


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='sale_items')
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    # Snapshot dos valores do produto no momento da venda: uma nota fiscal não
    # deve mudar de valor se o cadastro do produto for alterado depois.
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    commission_percentage = models.DecimalField(max_digits=4, decimal_places=2)

    class Meta:
        verbose_name = 'Item da Venda'
        verbose_name_plural = 'Itens da Venda'

    def save(self, *args, **kwargs):
        if self._state.adding:
            if self.unit_price is None:
                self.unit_price = self.product.unit_price
            if self.commission_percentage is None:
                self.commission_percentage = self._resolve_commission_percentage()
        super().save(*args, **kwargs)

    def _resolve_commission_percentage(self) -> Decimal:
        base = self.product.commission_percentage
        # localtime() usa settings.TIME_ZONE, não o fuso do SO, para achar o
        # dia da semana "de negócio" em que a venda ocorreu.
        weekday = timezone.localtime(self.sale.date_time).weekday()
        rule = CommissionRule.objects.filter(weekday=weekday).first()
        return rule.clamp(base) if rule else base

    @property
    def total_amount(self) -> Decimal:
        return self.quantity * self.unit_price

    @property
    def commission_amount(self) -> Decimal:
        return (self.total_amount * self.commission_percentage / Decimal('100')).quantize(Decimal('0.01'))

    def __str__(self):
        return f'{self.product.code} x{self.quantity} ({self.sale.invoice_number})'

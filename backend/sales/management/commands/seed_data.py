from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from sales.models import Client, CommissionRule, Product, Sale, SaleItem, Seller


class Command(BaseCommand):
    help = 'Popula o banco com dados de exemplo (produtos, clientes, vendedores e vendas).'

    def handle(self, *args, **options):
        if Product.objects.exists():
            self.stdout.write(self.style.WARNING('Já existem dados. Nada foi criado.'))
            return

        products = [
            Product.objects.create(code='CAN001', description='Caneta esferográfica azul', unit_price=Decimal('2.50'), commission_percentage=Decimal('2.00')),
            Product.objects.create(code='CAD001', description='Caderno universitário 200 folhas', unit_price=Decimal('24.90'), commission_percentage=Decimal('8.00')),
            Product.objects.create(code='LAP001', description='Lápis grafite HB', unit_price=Decimal('1.20'), commission_percentage=Decimal('1.50')),
            Product.objects.create(code='MOC001', description='Mochila escolar', unit_price=Decimal('149.90'), commission_percentage=Decimal('10.00')),
            Product.objects.create(code='MAR001', description='Marca-texto amarelo', unit_price=Decimal('4.90'), commission_percentage=Decimal('3.00')),
        ]

        clients = [
            Client.objects.create(name='Ana Souza', email='ana.souza@example.com', phone='(14) 99111-1111'),
            Client.objects.create(name='Bruno Lima', email='bruno.lima@example.com', phone='(14) 99222-2222'),
            Client.objects.create(name='Carla Nunes', email='carla.nunes@example.com', phone='(14) 99333-3333'),
        ]

        sellers = [
            Seller.objects.create(name='Diego Alves', email='diego.alves@example.com', phone='(14) 98111-1111'),
            Seller.objects.create(name='Elaine Rocha', email='elaine.rocha@example.com', phone='(14) 98222-2222'),
        ]

        CommissionRule.objects.create(weekday=CommissionRule.Weekday.MONDAY, min_percentage=Decimal('3.00'), max_percentage=Decimal('5.00'))
        CommissionRule.objects.create(weekday=CommissionRule.Weekday.FRIDAY, min_percentage=Decimal('1.00'), max_percentage=Decimal('4.00'))

        now = timezone.now()
        sample_sales = [
            ('NF-1001', now - timedelta(days=6), clients[0], sellers[0], [(products[0], 3), (products[1], 1)]),
            ('NF-1002', now - timedelta(days=4), clients[1], sellers[1], [(products[3], 1)]),
            ('NF-1003', now - timedelta(days=2), clients[2], sellers[0], [(products[2], 10), (products[4], 2)]),
            ('NF-1004', now - timedelta(days=1), clients[0], sellers[1], [(products[1], 2), (products[3], 1)]),
        ]
        for invoice_number, date_time, client, seller, items in sample_sales:
            sale = Sale.objects.create(invoice_number=invoice_number, date_time=date_time, client=client, seller=seller)
            for product, quantity in items:
                SaleItem.objects.create(sale=sale, product=product, quantity=quantity)

        self.stdout.write(self.style.SUCCESS('Dados de exemplo criados com sucesso.'))

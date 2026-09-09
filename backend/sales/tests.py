from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from .models import Client, CommissionRule, Product, Sale, SaleItem, Seller

# 2024-01-01 é uma segunda-feira; 2024-01-05 é uma sexta-feira. Usamos datas
# fixas para que o dia da semana do teste seja determinístico.
MONDAY = timezone.make_aware(timezone.datetime(2024, 1, 1, 10, 0))
FRIDAY = timezone.make_aware(timezone.datetime(2024, 1, 5, 10, 0))


class CommissionCalculationTests(TestCase):
    def setUp(self):
        self.client_obj = Client.objects.create(name='Ana', email='ana@example.com', phone='111')
        self.seller = Seller.objects.create(name='Bruno', email='bruno@example.com', phone='222')

    def test_commission_without_rule_uses_product_percentage(self):
        product = Product.objects.create(code='P1', description='Caneta', unit_price=Decimal('10.00'), commission_percentage=Decimal('7.00'))
        sale = Sale.objects.create(invoice_number='NF1', date_time=FRIDAY, client=self.client_obj, seller=self.seller)
        item = SaleItem.objects.create(sale=sale, product=product, quantity=2)

        self.assertEqual(item.unit_price, Decimal('10.00'))
        self.assertEqual(item.commission_percentage, Decimal('7.00'))
        self.assertEqual(item.total_amount, Decimal('20.00'))
        self.assertEqual(item.commission_amount, Decimal('1.40'))

    def test_commission_capped_at_rule_max(self):
        CommissionRule.objects.create(weekday=CommissionRule.Weekday.MONDAY, min_percentage=Decimal('3.00'), max_percentage=Decimal('5.00'))
        product = Product.objects.create(code='P2', description='Caderno', unit_price=Decimal('20.00'), commission_percentage=Decimal('10.00'))
        sale = Sale.objects.create(invoice_number='NF2', date_time=MONDAY, client=self.client_obj, seller=self.seller)
        item = SaleItem.objects.create(sale=sale, product=product, quantity=1)

        self.assertEqual(item.commission_percentage, Decimal('5.00'))
        self.assertEqual(item.commission_amount, Decimal('1.00'))

    def test_commission_raised_to_rule_min(self):
        CommissionRule.objects.create(weekday=CommissionRule.Weekday.MONDAY, min_percentage=Decimal('3.00'), max_percentage=Decimal('5.00'))
        product = Product.objects.create(code='P3', description='Lápis', unit_price=Decimal('5.00'), commission_percentage=Decimal('2.00'))
        sale = Sale.objects.create(invoice_number='NF3', date_time=MONDAY, client=self.client_obj, seller=self.seller)
        item = SaleItem.objects.create(sale=sale, product=product, quantity=1)

        self.assertEqual(item.commission_percentage, Decimal('3.00'))

    def test_sale_totals_sum_all_items(self):
        product_a = Product.objects.create(code='A', description='A', unit_price=Decimal('10.00'), commission_percentage=Decimal('5.00'))
        product_b = Product.objects.create(code='B', description='B', unit_price=Decimal('50.00'), commission_percentage=Decimal('1.00'))
        sale = Sale.objects.create(invoice_number='NF4', date_time=FRIDAY, client=self.client_obj, seller=self.seller)
        SaleItem.objects.create(sale=sale, product=product_a, quantity=3)  # 30.00, comissão 1.50
        SaleItem.objects.create(sale=sale, product=product_b, quantity=1)  # 50.00, comissão 0.50

        self.assertEqual(sale.total_amount, Decimal('80.00'))
        self.assertEqual(sale.total_commission, Decimal('2.00'))

    def test_item_keeps_historical_price_after_product_changes(self):
        product = Product.objects.create(code='P5', description='Marcador', unit_price=Decimal('8.00'), commission_percentage=Decimal('6.00'))
        sale = Sale.objects.create(invoice_number='NF5', date_time=FRIDAY, client=self.client_obj, seller=self.seller)
        item = SaleItem.objects.create(sale=sale, product=product, quantity=1)

        product.unit_price = Decimal('99.00')
        product.commission_percentage = Decimal('1.00')
        product.save()
        item.refresh_from_db()

        self.assertEqual(item.unit_price, Decimal('8.00'))
        self.assertEqual(item.commission_percentage, Decimal('6.00'))


class CommissionReportAPITests(APITestCase):
    def setUp(self):
        self.client_obj = Client.objects.create(name='Ana', email='ana@example.com', phone='111')
        self.seller_1 = Seller.objects.create(name='Bruno', email='bruno@example.com', phone='222')
        self.seller_2 = Seller.objects.create(name='Carla', email='carla@example.com', phone='333')
        self.product = Product.objects.create(code='P1', description='Caneta', unit_price=Decimal('10.00'), commission_percentage=Decimal('5.00'))

        sale_in_range = Sale.objects.create(invoice_number='NF1', date_time=FRIDAY, client=self.client_obj, seller=self.seller_1)
        SaleItem.objects.create(sale=sale_in_range, product=self.product, quantity=2)  # comissão 1.00

        sale_other_seller = Sale.objects.create(invoice_number='NF2', date_time=FRIDAY, client=self.client_obj, seller=self.seller_2)
        SaleItem.objects.create(sale=sale_other_seller, product=self.product, quantity=1)  # comissão 0.50

        out_of_range = timezone.make_aware(timezone.datetime(2024, 2, 1, 10, 0))
        sale_out_of_range = Sale.objects.create(invoice_number='NF3', date_time=out_of_range, client=self.client_obj, seller=self.seller_1)
        SaleItem.objects.create(sale=sale_out_of_range, product=self.product, quantity=10)

    def test_requires_date_range(self):
        response = self.client.get(reverse('commission-report'))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_returns_totals_per_seller_within_range(self):
        response = self.client.get(reverse('commission-report'), {'start_date': '2024-01-01', 'end_date': '2024-01-31'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        sellers = {entry['seller_name']: entry['total_commission'] for entry in response.data['sellers']}
        self.assertEqual(sellers['Bruno'], '1.00')
        self.assertEqual(sellers['Carla'], '0.50')
        self.assertEqual(response.data['total_commission'], '1.50')


class SaleAPITests(APITestCase):
    def setUp(self):
        self.client_obj = Client.objects.create(name='Ana', email='ana@example.com', phone='111')
        self.seller = Seller.objects.create(name='Bruno', email='bruno@example.com', phone='222')
        self.product = Product.objects.create(code='P1', description='Caneta', unit_price=Decimal('10.00'), commission_percentage=Decimal('5.00'))

    def test_create_sale_with_items(self):
        payload = {
            'invoice_number': 'NF100',
            'date_time': FRIDAY.isoformat(),
            'client': self.client_obj.id,
            'seller': self.seller.id,
            'items': [{'product': self.product.id, 'quantity': 3}],
        }
        response = self.client.post(reverse('sale-list'), payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        sale = Sale.objects.get(invoice_number='NF100')
        self.assertEqual(sale.items.count(), 1)
        self.assertEqual(sale.total_amount, Decimal('30.00'))

    def test_create_sale_without_items_is_rejected(self):
        payload = {
            'invoice_number': 'NF101',
            'date_time': FRIDAY.isoformat(),
            'client': self.client_obj.id,
            'seller': self.seller.id,
            'items': [],
        }
        response = self.client.post(reverse('sale-list'), payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_sale(self):
        sale = Sale.objects.create(invoice_number='NF102', date_time=FRIDAY, client=self.client_obj, seller=self.seller)
        SaleItem.objects.create(sale=sale, product=self.product, quantity=1)

        response = self.client.delete(reverse('sale-detail', args=[sale.id]))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Sale.objects.filter(id=sale.id).exists())

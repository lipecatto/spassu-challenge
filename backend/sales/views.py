from collections import OrderedDict
from datetime import date, datetime, time
from decimal import Decimal

import django_filters
from rest_framework import filters, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from django.utils import timezone

from .models import Client, Product, Sale, Seller
from .serializers import ClientSerializer, ProductSerializer, SaleSerializer, SellerSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'description']
    ordering_fields = ['code', 'description', 'unit_price', 'commission_percentage']


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email']
    ordering_fields = ['name']


class SellerViewSet(viewsets.ModelViewSet):
    queryset = Seller.objects.all()
    serializer_class = SellerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email']
    ordering_fields = ['name']


class SaleFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name='date_time', lookup_expr='date__gte')
    end_date = django_filters.DateFilter(field_name='date_time', lookup_expr='date__lte')

    class Meta:
        model = Sale
        fields = ['seller', 'client', 'start_date', 'end_date']


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.select_related('client', 'seller').prefetch_related('items__product')
    serializer_class = SaleSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = SaleFilter
    ordering_fields = ['date_time', 'invoice_number']


def _parse_report_dates(params):
    start_date = params.get('start_date')
    end_date = params.get('end_date')
    if not start_date or not end_date:
        raise ValueError('Os parâmetros start_date e end_date (YYYY-MM-DD) são obrigatórios.')
    try:
        start = timezone.make_aware(datetime.combine(date.fromisoformat(start_date), time.min))
        end = timezone.make_aware(datetime.combine(date.fromisoformat(end_date), time.max))
    except ValueError as exc:
        raise ValueError('Datas inválidas. Use o formato YYYY-MM-DD.') from exc
    return start_date, end_date, start, end


class CommissionReportView(APIView):
    """Comissão total por vendedor para as vendas feitas em um período."""

    def get(self, request):
        try:
            start_date, end_date, start, end = _parse_report_dates(request.query_params)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=400)

        sales = (
            Sale.objects
            .filter(date_time__range=(start, end))
            .select_related('seller')
            .prefetch_related('items')
        )

        totals = OrderedDict()
        for sale in sales:
            entry = totals.setdefault(
                sale.seller_id,
                {'seller_id': sale.seller_id, 'seller_name': sale.seller.name, 'total_commission': Decimal('0')},
            )
            entry['total_commission'] += sale.total_commission

        sellers = sorted(totals.values(), key=lambda entry: entry['seller_name'])
        total_commission = sum((entry['total_commission'] for entry in sellers), Decimal('0'))

        return Response({
            'start_date': start_date,
            'end_date': end_date,
            'sellers': [
                {
                    'seller_id': entry['seller_id'],
                    'seller_name': entry['seller_name'],
                    'total_commission': str(entry['total_commission'].quantize(Decimal('0.01'))),
                }
                for entry in sellers
            ],
            'total_commission': str(total_commission.quantize(Decimal('0.01'))),
        })

from rest_framework import serializers

from .models import Client, CommissionRule, Product, Sale, SaleItem, Seller


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'phone']


class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seller
        fields = ['id', 'name', 'email', 'phone']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'code', 'description', 'unit_price', 'commission_percentage']


class CommissionRuleSerializer(serializers.ModelSerializer):
    weekday_display = serializers.CharField(source='get_weekday_display', read_only=True)

    class Meta:
        model = CommissionRule
        fields = ['id', 'weekday', 'weekday_display', 'min_percentage', 'max_percentage']

    def validate(self, attrs):
        min_percentage = attrs.get('min_percentage', getattr(self.instance, 'min_percentage', None))
        max_percentage = attrs.get('max_percentage', getattr(self.instance, 'max_percentage', None))
        if min_percentage is not None and max_percentage is not None and min_percentage > max_percentage:
            raise serializers.ValidationError('min_percentage não pode ser maior que max_percentage.')
        return attrs


class SaleItemSerializer(serializers.ModelSerializer):
    product_code = serializers.CharField(source='product.code', read_only=True)
    product_description = serializers.CharField(source='product.description', read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    commission_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = SaleItem
        fields = [
            'id', 'product', 'product_code', 'product_description', 'quantity',
            'unit_price', 'commission_percentage', 'total_amount', 'commission_amount',
        ]
        read_only_fields = ['unit_price', 'commission_percentage']


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    seller_name = serializers.CharField(source='seller.name', read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_commission = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'invoice_number', 'date_time', 'client', 'client_name', 'seller', 'seller_name',
            'items', 'total_amount', 'total_commission',
        ]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError('A venda precisa ter ao menos um item.')
        return items

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sale = Sale.objects.create(**validated_data)
        for item_data in items_data:
            SaleItem.objects.create(sale=sale, **item_data)
        return sale

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                SaleItem.objects.create(sale=instance, **item_data)

        return instance

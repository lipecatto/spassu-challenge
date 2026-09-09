from django.contrib import admin

from .models import Client, CommissionRule, Product, Sale, SaleItem, Seller


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('code', 'description', 'unit_price', 'commission_percentage')
    search_fields = ('code', 'description')


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone')
    search_fields = ('name', 'email')


@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone')
    search_fields = ('name', 'email')


@admin.register(CommissionRule)
class CommissionRuleAdmin(admin.ModelAdmin):
    list_display = ('get_weekday_display', 'min_percentage', 'max_percentage')
    ordering = ('weekday',)

    @admin.display(description='Dia da semana')
    def get_weekday_display(self, obj):
        return obj.get_weekday_display()


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 1
    readonly_fields = ('unit_price', 'commission_percentage')


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'date_time', 'client', 'seller', 'total_amount', 'total_commission')
    list_filter = ('seller', 'client')
    search_fields = ('invoice_number', 'client__name', 'seller__name')
    inlines = [SaleItemInline]

from rest_framework.routers import DefaultRouter

from django.urls import include, path

from .views import ClientViewSet, CommissionReportView, ProductViewSet, SaleViewSet, SellerViewSet

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('clients', ClientViewSet)
router.register('sellers', SellerViewSet)
router.register('sales', SaleViewSet)

urlpatterns = [
    path('commissions/', CommissionReportView.as_view(), name='commission-report'),
    path('', include(router.urls)),
]

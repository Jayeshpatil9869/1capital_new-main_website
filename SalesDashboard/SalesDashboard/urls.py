from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import (
    dashboard_view,
    custom_logout_view,
    data_upload_view,
    mutual_funds_view,
    pms_aif_view,
    upload_portal_login_view,
    upload_portal_view,
    delete_file_view,
    market_ticker,
)
from core.views_root import root_redirect, website_view, about_us_view, mf_advisor_view, spa_index_view
from core.api_views import LoginView, CurrentUserView, UploadPortalFilesView
from core.api_dashboard import DashboardSummaryView, DashboardFullView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('accounts/logout/', custom_logout_view, name='logout'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('', root_redirect, name='root-redirect'),
    path('website', website_view),
    path('website/', website_view, name='website'),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('mutual-funds/', mutual_funds_view, name='mutual_funds'),
    path('pms-aif/', pms_aif_view, name='pms_aif'),
    path('about-us/', about_us_view, name='about_us'),
    path('mf-advisor/', mf_advisor_view, name='mf_advisor'),
    path('api/data-upload/', data_upload_view, name='data_upload'),
    path("api/market-ticker/", market_ticker, name="market_ticker"),

    # API auth for React SPA
    path("api/auth/login/", LoginView.as_view(), name="api_login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/me/", CurrentUserView.as_view(), name="current_user"),
    path("api/dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard_summary"),
    path("api/dashboard/full/", DashboardFullView.as_view(), name="dashboard_full"),

    # Upload Portal (prerana-only)
    path('upload-portal/login/', upload_portal_login_view, name='upload_portal_login'),
    path('upload-portal/', upload_portal_view, name='upload_portal'),
    path('api/delete-file/', delete_file_view, name='delete_file'),
    path('api/upload/list/', UploadPortalFilesView.as_view(), name='api_upload_list'),

    # React SPA entry (served for all /app/* routes on the client)
    path('app/', spa_index_view, name='spa_index'),
    path('app/<path:rest>/', spa_index_view, name='spa_catchall'),
]

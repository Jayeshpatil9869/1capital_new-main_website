import pandas as pd
import json

import requests
from django.conf import settings
from django.http import JsonResponse
from django.core.cache import cache

from decimal import Decimal
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.db.models import Sum, Q
from django.http import HttpResponseForbidden
from .models import SalesRecord, UserProfile, Employee
from .analytics import BrokerageAnalytics, DataQuality
from django.contrib.auth import views as auth_views
try:
    import numpy as np
except ImportError:
    np = None

# Placeholder functions needed for urls.py to import successfully
user_login = auth_views.LoginView.as_view(template_name='registration/login.html')
user_logout = auth_views.LogoutView.as_view(next_page='/')


def custom_logout_view(request):
    """Custom logout view that logs out the user and redirects to login page."""
    logout(request)
    return redirect('/accounts/login/')


def mutual_funds_view(request):
    """View for Mutual Funds page."""
    return render(request, 'mutual_funds.html')


def pms_aif_view(request):
    """View for PMS and AIF page."""
    return render(request, 'pms_aif.html')


def sanitize_for_json(obj):
    """Convert Decimal and other non-JSON-serializable types to JSON-friendly formats."""
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize_for_json(v) for v in obj]
    if isinstance(obj, tuple):
        return tuple(sanitize_for_json(v) for v in obj)
    if obj is None:
        return obj
    if isinstance(obj, Decimal):
        return float(obj)
    if np:
        if isinstance(obj, (np.integer, np.int64, np.int32)):
            return int(obj)
        if isinstance(obj, (np.floating, np.float64, np.float32)):
            return float(obj)
    return obj



def get_cached_stock(name: str, timeout: int = 600) -> dict:
    """
    Get stock data for `name`, cached in Django cache for `timeout` seconds.
    """
    cache_key = f"ticker:{name}"
    data = cache.get(cache_key)
    if data is None:
        data = _fetch_stock(name) 
        cache.set(cache_key, data, timeout=3*60*60)
    return data

def _fetch_stock(name: str) -> dict:
    """
    Call Indian API /stock endpoint for a given name.

    Returns a dict with keys: value, percent_change, company_name, raw.
    """
    base_url = getattr(settings, "INDIAN_STOCK_API_BASE_URL", "https://stock.indianapi.in")
    api_key = settings.INDIAN_STOCK_API_KEY

    resp = requests.get(
        f"{base_url}/stock",
        params={"name": name},
        headers={"x-api-key": api_key},
        timeout=5,
    )
    resp.raise_for_status()
    data = resp.json()

    # Prefer NSE price if present, fallback to BSE or reusable price
    price = None
    if data.get("currentPrice"):
        price = data["currentPrice"].get("NSE") or data["currentPrice"].get("BSE")
    if price is None and data.get("stockDetailsReusableData"):
        price = data["stockDetailsReusableData"].get("price")

    # Prefer more reliable percentChange field
    percent_change = data.get("percentChange")
    if percent_change is None and data.get("stockDetailsReusableData"):
        percent_change = data["stockDetailsReusableData"].get("percentChange")

    return {
        "company_name": data.get("companyName"),
        "value": float(price) if price not in (None, "-", "") else None,
        "change": float(percent_change) if percent_change not in (None, "-", "") else None,
        "raw": data,
    }


# def market_ticker(request):
#     """
#     Returns JSON with Sensex, Nifty 50, Gold, and Alpha Strategy values
#     using stock.indianapi.in.
#     """
#     try:
#         index_map = getattr(settings, "INDEX_NAME_MAP", {})
#         sensex = _fetch_stock(index_map.get("sensex", "Sensex"))
#         nifty50 = _fetch_stock(index_map.get("nifty50", "Nifty 50"))
#         gold = _fetch_stock(index_map.get("gold", "Gold"))
#         alpha = _fetch_stock(index_map.get("alpha_strategy", "ITBEES"))

#         payload = {
#             "sensex": {"value": sensex["value"], "change": sensex["change"]},
#             "nifty50": {"value": nifty50["value"], "change": nifty50["change"]},
#             "gold": {"value": gold["value"], "change": gold["change"]},
#             "alpha_strategy": {"value": alpha["value"], "change": alpha["change"]},
#         }
#         return JsonResponse({"error": None, "data": payload})
#     except requests.RequestException as e:
#         return JsonResponse(
#             {"error": f"API request failed: {e}", "data": None},
#             status=502,
#         )
#     except Exception as e:
#         return JsonResponse(
#             {"error": f"Internal error: {e}", "data": None},
#             status=500,
#         )


def market_ticker(request):
    """
    Returns JSON with Sensex, Nifty 50, Gold, and Alpha Strategy values
    using stock.indianapi.in, with per-symbol caching.
    """
    try:
        index_map = getattr(settings, "INDEX_NAME_MAP", {})

        sensex = get_cached_stock(index_map.get("sensex", "Sensex"))
        nifty50 = get_cached_stock(index_map.get("nifty50", "Nifty 50"))
        gold = get_cached_stock(index_map.get("gold", "Gold"))
        alpha = get_cached_stock(index_map.get("alpha_strategy", "ITBEES"))

        payload = {
            "sensex": {"value": sensex["value"], "change": sensex["change"]},
            "nifty50": {"value": nifty50["value"], "change": nifty50["change"]},
            "gold": {"value": gold["value"], "change": gold["change"]},
            "alpha_strategy": {"value": alpha["value"], "change": alpha["change"]},
        }
        return JsonResponse({"error": None, "data": payload})

    except requests.RequestException as e:
        return JsonResponse(
            {"error": f"API request failed: {e}", "data": None},
            status=502,
        )
    except Exception as e:
        return JsonResponse(
            {"error": f"Internal error: {e}", "data": None},
            status=500,
        )


@login_required
def dashboard_view(request):
    context = build_dashboard_context(user=request.user, params=request.GET)
    return render(request, 'dashboard.html', context)


def build_dashboard_context(user, params):
    """
    Shared dashboard context builder used by both the HTML template view and the API.
    `params` is any dict-like object supporting `.get()`.
    """
    # Get user profile and determine role
    try:
        user_profile = UserProfile.objects.get(user=user)
        user_role = user_profile.role
    except UserProfile.DoesNotExist:
        user_role = 'R'  # Default to RM/MA role

    # Get filter parameters
    selected_rm = (params.get('rm', '') or '').strip()
    selected_ma = (params.get('ma', '') or '').strip()
    selected_manager = (params.get('manager', '') or '').strip()
    selected_period = (params.get('period', '') or '').strip()
    selected_date_from = (params.get('date_from', '') or '').strip()
    selected_date_to = (params.get('date_to', '') or '').strip()

    # --- Dropdown Option Population (HIERARCHY-BASED) ---
    all_managers = []
    all_rms = []
    all_mas = []

    # 1. Populating Manager List (only if Leader)
    if user_role == 'L':
        all_managers = list(
            Employee.objects.filter(designation='M')
            .values_list('rm_name', flat=True)
            .distinct()
            .order_by('rm_name')
        )
    
    # 2. Populating RM List (designation='L1')
    if user_role == 'L':
        if selected_manager:
            all_rms = list(
                Employee.objects.filter(
                    Q(manager__rm_name=selected_manager) | Q(rm_manager_name=selected_manager),
                    designation='L1'
                )
                .values_list('rm_name', flat=True)
                .distinct()
                .order_by('rm_name')
            )
        else:
            all_rms = list(
                Employee.objects.filter(designation='L1')
                .values_list('rm_name', flat=True)
                .distinct()
                .order_by('rm_name')
            )
    elif user_role == 'M':
        user_full_name = user.get_full_name() or user.username.replace('_', ' ').title()
        all_rms = list(
            Employee.objects.filter(
                Q(manager__rm_name=user_full_name) | Q(rm_manager_name=user_full_name),
                designation='L1'
            )
            .values_list('rm_name', flat=True)
            .distinct()
            .order_by('rm_name')
        )
    elif user_role == 'R':
        # If user is L1, they only see themselves
        user_full_name = user.get_full_name() or user.username.replace('_', ' ').title()
        try:
            emp = Employee.objects.get(rm_name=user_full_name)
            if emp.designation == 'L1':
                all_rms = [user_full_name]
            else:
                # If they are MA, they don't see RM dropdown or it shows their supervisor
                all_rms = [emp.rm_manager_name] if emp.rm_manager_name else []
        except Employee.DoesNotExist:
            all_rms = [user_full_name]

    # 3. Populating MA List (designation='MA')
    if selected_rm:
        all_mas = list(
            Employee.objects.filter(
                Q(manager__rm_name=selected_rm) | Q(rm_manager_name=selected_rm),
                designation='MA'
            )
            .values_list('rm_name', flat=True)
            .distinct()
            .order_by('rm_name')
        )
    elif selected_manager:
        # Include MAs who report directly to the Manager OR report to an L1 under this Manager
        all_mas = list(
            Employee.objects.filter(
                Q(manager__rm_name=selected_manager) | 
                Q(manager__manager__rm_name=selected_manager) | 
                Q(manager__rm_manager_name=selected_manager),
                designation='MA'
            )
            .values_list('rm_name', flat=True)
            .distinct()
            .order_by('rm_name')
        )
    else:
        # General list of MAs based on role
        if user_role == 'L':
            all_mas = list(Employee.objects.filter(designation='MA').values_list('rm_name', flat=True).distinct().order_by('rm_name'))
        elif user_role == 'M':
            user_full_name = user.get_full_name() or user.username.replace('_', ' ').title()
            all_mas = list(
                Employee.objects.filter(
                    Q(manager__rm_name=user_full_name) |
                    Q(manager__manager__rm_name=user_full_name) | 
                    Q(manager__rm_manager_name=user_full_name),
                    designation='MA'
                )
                .values_list('rm_name', flat=True)
                .distinct()
                .order_by('rm_name')
            )
        elif user_role == 'R':
            user_full_name = user.get_full_name() or user.username.replace('_', ' ').title()
            try:
                emp = Employee.objects.get(rm_name=user_full_name)
                if emp.designation == 'L1':
                    all_mas = list(Employee.objects.filter(
                        Q(manager__rm_name=user_full_name) | Q(rm_manager_name=user_full_name),
                        designation='MA'
                    ).values_list('rm_name', flat=True).distinct().order_by('rm_name'))
                else:
                    all_mas = [user_full_name]
            except Employee.DoesNotExist:
                all_mas = [user_full_name]

    # --- Data Filtering Logic ---
    records_queryset = SalesRecord.objects.all()

    if selected_ma:
        # Filter by MA name
        records_queryset = records_queryset.filter(ma_name=selected_ma)
    elif selected_rm:
        # Filter by RM (L1) name - include records where they are RM, and records for their MAs
        ma_subordinates = list(Employee.objects.filter(
            Q(manager__rm_name=selected_rm) | Q(rm_manager_name=selected_rm),
            designation='MA'
        ).values_list('rm_name', flat=True))
        records_queryset = records_queryset.filter(Q(rm_name=selected_rm) | Q(ma_name__in=ma_subordinates))
    elif selected_manager:
        # Filter by Manager name - include all their L1s and MAs
        # Get all L1s reporting to this manager
        manager_l1s = list(Employee.objects.filter(
            Q(manager__rm_name=selected_manager) | Q(rm_manager_name=selected_manager),
            designation='L1'
        ).values_list('rm_name', flat=True))
        
        # Get all MAs reporting to this manager (direct or via L1)
        manager_mas = list(Employee.objects.filter(
            Q(manager__rm_name=selected_manager) | 
            Q(manager__manager__rm_name=selected_manager) | 
            Q(rm_manager_name=selected_manager),
            designation='MA'
        ).values_list('rm_name', flat=True))
        
        records_queryset = records_queryset.filter(
            Q(rm_name__in=manager_l1s) | Q(ma_name__in=manager_mas) | Q(rm_name=selected_manager)
        )
    else:
        # Role-based default filtering if no dropdowns selected
        if user_role == 'M':
            user_full_name = user.get_full_name() or user.username.replace('_', ' ').title()
            # Same logic as selected_manager but for the current user
            m_l1s = list(Employee.objects.filter(
                Q(manager__rm_name=user_full_name) | Q(rm_manager_name=user_full_name),
                designation='L1'
            ).values_list('rm_name', flat=True))
            
            m_mas = list(Employee.objects.filter(
                Q(manager__rm_name=user_full_name) | 
                Q(manager__manager__rm_name=user_full_name) | 
                Q(rm_manager_name=user_full_name),
                designation='MA'
            ).values_list('rm_name', flat=True))
            
            records_queryset = records_queryset.filter(
                Q(rm_name__in=m_l1s) | Q(ma_name__in=m_mas) | Q(rm_name=user_full_name)
            )
        elif user_role == 'R':
            user_full_name = user.get_full_name() or user.username.replace('_', ' ').title()
            try:
                emp = Employee.objects.get(rm_name=user_full_name)
                if emp.designation == 'L1':
                    # L1 sees their own records + their MAs
                    r_mas = list(Employee.objects.filter(
                        Q(manager__rm_name=user_full_name) | Q(rm_manager_name=user_full_name),
                        designation='MA'
                    ).values_list('rm_name', flat=True))
                    records_queryset = records_queryset.filter(Q(rm_name=user_full_name) | Q(ma_name__in=r_mas))
                else:
                    # MA sees only their own
                    records_queryset = records_queryset.filter(ma_name=user_full_name)
            except Employee.DoesNotExist:
                records_queryset = records_queryset.filter(Q(rm_name=user_full_name) | Q(ma_name=user_full_name))

    # --- Date Range Filtering ---
    if selected_date_from:
        try:
            records_queryset = records_queryset.filter(transaction_date__gte=selected_date_from)
        except:
            pass
    if selected_date_to:
        try:
            records_queryset = records_queryset.filter(transaction_date__lte=selected_date_to)
        except:
            pass

    # Get available periods
    available_periods = BrokerageAnalytics.get_available_periods()

    # Calculate totals using analytics engine (includes both Equity + MF)
    filters = {
        'rm_name': selected_rm if selected_rm else None,
        'ma_name': selected_ma if selected_ma else None,
        'period': selected_period if selected_period else None,
        'date_from': selected_date_from if selected_date_from else None,
        'date_to': selected_date_to if selected_date_to else None,
    }
    total_brokerage = BrokerageAnalytics.get_total_brokerage(filters)

    totals = records_queryset.aggregate(
        total_brokerage=Sum('total_brokerage'),
        total_mf_brokerage=Sum('mf_brokerage'),
        total_equity_cash=Sum('total_equity_cash_turnover'),
        total_equity_fno=Sum('total_equity_fno_turnover'),
        total_turnover=Sum('total_turnover'),
    )
    totals = {k: (v or 0) for k, v in totals.items()}
    totals['combined_total_brokerage'] = total_brokerage

    # Convert to DataFrame for charting
    records_data = list(records_queryset.values())
    chart_data = {
        'rms': all_rms,
        'mas': all_mas,
        'periods': available_periods,
        'selected_rm': selected_rm,
        'selected_ma': selected_ma,
        'selected_period': selected_period,
        'totals': totals,
        'rm_performance': {'labels': [], 'brokerage': [], 'mf_brokerage': [], 'combined': [], 'equity_cash': [], 'equity_fno': [], 'total_turnover': []},
        'ma_performance': {'labels': [], 'brokerage': [], 'mf_brokerage': [], 'combined': [], 'equity_cash': [], 'equity_fno': []},
        'top_clients': {'labels': [], 'brokerage': [], 'mf_brokerage': [], 'combined': [], 'rm': []},
        'segment_analysis': {'labels': [], 'cash': [], 'fno': []},
    }

    if records_data:
        df = pd.DataFrame(records_data)

        numeric_cols = [
            'total_brokerage', 'mf_brokerage', 'cash_delivery', 'equity_cash_delivery_turnover',
            'equity_futures_turnover', 'equity_options_turnover', 'total_equity_cash_turnover',
            'total_equity_fno_turnover', 'total_equity_turnover', 'total_turnover'
        ]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        rm_perf = df.groupby('rm_name').agg({
            'total_brokerage': 'sum',
            'mf_brokerage': 'sum',
            'total_equity_cash_turnover': 'sum',
            'total_equity_fno_turnover': 'sum',
            'total_turnover': 'sum',
        }).reset_index()
        rm_perf['combined_brokerage'] = rm_perf['total_brokerage'] + rm_perf['mf_brokerage']
        rm_perf = rm_perf.sort_values('combined_brokerage', ascending=False)

        chart_data['rm_performance'] = {
            'labels': rm_perf['rm_name'].tolist(),
            'brokerage': [float(x) for x in rm_perf['total_brokerage'].tolist()],
            'mf_brokerage': [float(x) for x in rm_perf['mf_brokerage'].tolist()],
            'combined': [float(x) for x in rm_perf['combined_brokerage'].tolist()],
            'equity_cash': [float(x) for x in rm_perf['total_equity_cash_turnover'].tolist()],
            'equity_fno': [float(x) for x in rm_perf['total_equity_fno_turnover'].tolist()],
            'total_turnover': [float(x) for x in rm_perf['total_turnover'].tolist()],
        }

        if 'ma_name' in df.columns:
            # If RM selected, show MAs under that RM.
            # If Manager selected but no RM, show ALL MAs under that Manager.
            ma_data = df.copy()
            if selected_rm:
                ma_data = ma_data[ma_data['rm_name'] == selected_rm]
            
            if not ma_data.empty:
                ma_data = ma_data[ma_data['ma_name'].notna() & (ma_data['ma_name'] != '')]
                if not ma_data.empty:
                    ma_perf = ma_data.groupby('ma_name').agg({
                        'total_brokerage': 'sum',
                        'mf_brokerage': 'sum',
                        'total_equity_cash_turnover': 'sum',
                        'total_equity_fno_turnover': 'sum',
                    }).reset_index()
                    ma_perf['combined_brokerage'] = ma_perf['total_brokerage'] + ma_perf['mf_brokerage']
                    ma_perf = ma_perf.sort_values('combined_brokerage', ascending=False).head(10)

                    chart_data['ma_performance'] = {
                        'labels': ma_perf['ma_name'].tolist(),
                        'brokerage': [float(x) for x in ma_perf['total_brokerage'].tolist()],
                        'mf_brokerage': [float(x) for x in ma_perf['mf_brokerage'].tolist()],
                        'combined': [float(x) for x in ma_perf['combined_brokerage'].tolist()],
                        'equity_cash': [float(x) for x in ma_perf['total_equity_cash_turnover'].tolist()],
                        'equity_fno': [float(x) for x in ma_perf['total_equity_fno_turnover'].tolist()],
                    }

        if 'client_name' in df.columns:
            df['combined_brokerage'] = df['total_brokerage'] + df['mf_brokerage']
            top_clients = df.nlargest(
                10,
                'combined_brokerage'
            )[['client_name', 'rm_name', 'total_brokerage', 'mf_brokerage', 'combined_brokerage', 'total_turnover']]

            chart_data['top_clients'] = {
                'labels': top_clients['client_name'].tolist(),
                'brokerage': [float(x) for x in top_clients['total_brokerage'].tolist()],
                'mf_brokerage': [float(x) for x in top_clients['mf_brokerage'].tolist()],
                'combined': [float(x) for x in top_clients['combined_brokerage'].tolist()],
                'rm': top_clients['rm_name'].tolist(),
            }

        if 'ma_name' in df.columns:
            segment_perf = df.groupby('ma_name').agg({
                'total_equity_cash_turnover': 'sum',
                'total_equity_fno_turnover': 'sum',
                'total_brokerage': 'sum',
            }).reset_index().sort_values('total_brokerage', ascending=False).head(10)

            chart_data['segment_analysis'] = {
                'labels': segment_perf['ma_name'].tolist(),
                'cash': [float(x) for x in segment_perf['total_equity_cash_turnover'].tolist()],
                'fno': [float(x) for x in segment_perf['total_equity_fno_turnover'].tolist()],
            }

    context = {
        'user': user,
        'user_role': user_role,
        'title': 'Sales Dashboard',
        'records': records_queryset.order_by('-total_brokerage')[:100],
        'all_rms': all_rms,
        'all_mas': all_mas,
        'all_managers': all_managers,
        'available_periods': available_periods,
        'selected_rm': selected_rm,
        'selected_ma': selected_ma,
        'selected_manager': selected_manager,
        'selected_period': selected_period,
        'selected_date_from': selected_date_from,
        'selected_date_to': selected_date_to,
        'chart_data': sanitize_for_json(chart_data),
        'totals': sanitize_for_json(totals),
    }
    context['chart_data_json'] = json.dumps(context['chart_data'])
    context['totals_json'] = json.dumps(context['totals'])
    return context


# =====================================================================
# UPLOAD PORTAL VIEWS (Prerana-only access)
# =====================================================================

UPLOAD_PORTAL_USER = 'prerana'


def upload_portal_login_view(request):
    """Custom login page exclusively for the Data Upload Portal."""
    # If already authenticated as prerana, go to portal
    if request.user.is_authenticated and request.user.username == UPLOAD_PORTAL_USER:
        return redirect('upload_portal')

    error = None
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()
        user = authenticate(request, username=username, password=password)
        if user is not None and user.username == UPLOAD_PORTAL_USER:
            login(request, user)
            return redirect('upload_portal')
        else:
            error = 'Invalid credentials. Only authorized users can access this portal.'

    return render(request, 'upload_portal_login.html', {'error': error})


def upload_portal_view(request):
    """Data Upload Portal - accessible only to the prerana user."""
    if not request.user.is_authenticated or request.user.username != UPLOAD_PORTAL_USER:
        return redirect(f'/upload-portal/login/?next=/upload-portal/')

    import os
    from django.conf import settings
    from pathlib import Path

    base_dir = Path(settings.BASE_DIR).parent
    data_folders = {
        'brokerage': base_dir / 'data_files' / 'brokerage_fact',
        'mf': base_dir / 'data_files' / 'MF_fact',
        'client': base_dir / 'data_files' / 'Client_dim',
        'employee': base_dir / 'data_files' / 'Employee_dim',
    }

    folder_files = {}
    for dtype, folder_path in data_folders.items():
        if folder_path.exists():
            files = []
            for f in sorted(folder_path.iterdir()):
                if f.is_file() and f.suffix.lower() in ['.xlsx', '.xls', '.csv']:
                    files.append({
                        'name': f.name,
                        'size': round(f.stat().st_size / 1024, 1),  # KB
                        'data_type': dtype,
                    })
            folder_files[dtype] = files
        else:
            folder_files[dtype] = []

    context = {
        'folder_files': folder_files,
        'user': request.user,
    }
    return render(request, 'upload_portal.html', context)


@login_required
def delete_file_view(request):
    """Delete a data file from disk and remove its records from the database."""
    if request.user.username != UPLOAD_PORTAL_USER:
        return json_response({'error': 'Access denied.'}, status=403)

    if request.method != 'POST':
        return json_response({'error': 'Method not allowed'}, status=405)

    import os
    from django.conf import settings
    from pathlib import Path

    data_type = request.POST.get('data_type', '')
    file_name = request.POST.get('file_name', '').strip()

    data_type_map = {
        'brokerage': 'brokerage_fact',
        'client': 'Client_dim',
        'employee': 'Employee_dim',
        'mf': 'MF_fact',
    }

    if not data_type or data_type not in data_type_map or not file_name:
        return json_response({'error': 'Invalid request parameters.'}, status=400)

    # Security: prevent path traversal
    if '/' in file_name or '\\' in file_name or '..' in file_name:
        return json_response({'error': 'Invalid file name.'}, status=400)

    base_dir = Path(settings.BASE_DIR).parent
    file_path = base_dir / 'data_files' / data_type_map[data_type] / file_name

    try:
        db_deleted = 0
        if data_type in ('brokerage', 'mf'):
            db_deleted, _ = SalesRecord.objects.filter(file_name=file_name).delete()

        file_existed = file_path.exists()
        if file_existed:
            os.remove(str(file_path))

        return json_response({
            'success': True,
            'message': f'Deleted {file_name}. Removed {db_deleted} database records.',
            'db_records_deleted': db_deleted,
            'file_deleted': file_existed,
        })
    except Exception as e:
        return json_response({'error': f'Delete failed: {str(e)}'}, status=500)


@login_required
def data_upload_view(request):
    """
    Handle data file uploads to the data_files folder.
    Supports uploading to different data folders based on data_type.
    Only authenticated users can upload data.
    """
    if request.method != 'POST':
        return json_response({'error': 'Method not allowed'}, status=405)
    
    import os
    from django.conf import settings
    from pathlib import Path
    
    try:
        # Get data type from form
        data_type = request.POST.get('data_type', '')
        
        # Map data types to folder paths
        data_type_map = {
            'brokerage': 'brokerage_fact',
            'client': 'Client_dim',
            'employee': 'Employee_dim',
            'mf': 'MF_fact',
        }
        
        if not data_type or data_type not in data_type_map:
            return json_response({'error': 'Invalid data type. Please select a valid data type.'}, status=400)
        
        folder_name = data_type_map[data_type]
        
        # Construct the path to data_files folder
        base_dir = Path(settings.BASE_DIR).parent
        data_folder_path = base_dir / 'data_files' / folder_name
        
        # Create folder if it doesn't exist
        data_folder_path.mkdir(parents=True, exist_ok=True)
        
        # Get uploaded files
        uploaded_files = request.FILES.getlist('data_file')
        
        if not uploaded_files:
            return json_response({'error': 'No files provided. Please select at least one file.'}, status=400)
        
        saved_files = []
        allowed_extensions = {'.csv', '.xlsx', '.xls'}
        
        for uploaded_file in uploaded_files:
            # Validate file size (max 50MB)
            if uploaded_file.size > 50 * 1024 * 1024:
                return json_response({'error': f'File {uploaded_file.name} exceeds 50MB limit'}, status=400)
            
            # Validate file extension
            file_ext = os.path.splitext(uploaded_file.name)[1].lower()
            if file_ext not in allowed_extensions:
                continue  # Skip invalid files in folder upload
            
            # Save the file
            file_path = data_folder_path / uploaded_file.name
            with open(file_path, 'wb') as f:
                for chunk in uploaded_file.chunks():
                    f.write(chunk)
            saved_files.append(uploaded_file.name)
        
        if not saved_files:
            return json_response({'error': 'No valid data files (.csv, .xlsx, .xls) found in the upload.'}, status=400)
        
        # Load data into database if applicable
        message = f'Successfully uploaded {len(saved_files)} files'
        try:
            from .data_pipeline import DataPipeline
            pipeline = DataPipeline()
            
            if data_type == 'brokerage':
                count = pipeline._load_brokerage_facts()
                message += f' - Total brokerage records: {count}'
            elif data_type == 'mf':
                count = pipeline._load_mf_facts()
                message += f' - Total MF records: {count}'
            elif data_type == 'employee':
                message += ' - Employee data updated. Command line sync recommended for hierarchy.'
            elif data_type == 'client':
                message += ' - Client data updated.'
        except Exception as e:
            message += f' (Note: Auto-load warning: {str(e)})'
        
        return json_response({
            'success': True,
            'message': message,
            'files': saved_files,
            'data_type': data_type,
            'folder': str(data_folder_path)
        })
    
    except Exception as e:
        return json_response({'error': f'Upload failed: {str(e)}'}, status=500)


def json_response(data, status=200):
    """Return JSON response with appropriate status code"""
    from django.http import JsonResponse
    return JsonResponse(data, status=status)

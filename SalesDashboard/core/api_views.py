from django.contrib.auth import authenticate
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .api_serializers import CurrentUserSerializer
from django.conf import settings
from pathlib import Path
import os


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "").strip()

        if not username or not password:
            return Response(
                {"detail": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if user is None or not user.is_active:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        user_data = CurrentUserSerializer(user).data

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": user_data,
            }
        )


class CurrentUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data)


class UploadPortalFilesView(APIView):
    """
    Returns JSON listing of files available in the data_files folders for the upload portal.
    Only accessible to the prerana upload user.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        UPLOAD_PORTAL_USER = 'prerana'
        if not request.user.is_authenticated or request.user.username != UPLOAD_PORTAL_USER:
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        base_dir = Path(settings.BASE_DIR).parent
        data_folders = {
            'brokerage': base_dir / 'data_files' / 'brokerage_fact',
            'mf': base_dir / 'data_files' / 'MF_fact',
            'client': base_dir / 'data_files' / 'Client_dim',
            'employee': base_dir / 'data_files' / 'Employee_dim',
        }

        folder_files = {}
        for dtype, folder_path in data_folders.items():
            files = []
            if folder_path.exists():
                for f in sorted(folder_path.iterdir()):
                    if f.is_file() and f.suffix.lower() in ['.xlsx', '.xls', '.csv']:
                        files.append({
                            'name': f.name,
                            'size': round(f.stat().st_size / 1024, 1),  # KB
                            'data_type': dtype,
                        })
            folder_files[dtype] = files

        return Response({'folder_files': folder_files})


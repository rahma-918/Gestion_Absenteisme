from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView
from apps.accounts.views import AdminDashboardView, AdminStatisticsView, EnseignantStatisticsView, EtudiantDashboardView, SignupView, LoginView
from apps.attendance.views import AbsencesNonJustifieesView, AnnulerEliminationView, ConfirmerEliminationView, DetecterEliminationsView, EliminationsAdminView, EnseignantJustificatifsView, JustificatifEtudiantView, NotifierEtudiantView, TraiterJustificatifView
from apps.accounts.views import EnseignantDashboardView
from apps.attendance.views import SeanceAppelView, PresenceBulkUpdateView
from apps.accounts.views import EnseignantAttendanceEvolutionView
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/signup/', SignupView.as_view(), name='signup'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/etudiant/dashboard/', EtudiantDashboardView.as_view(), name='etudiant-dashboard'),
    path('api/etudiant/absences-non-justifiees/', AbsencesNonJustifieesView.as_view(), name='absences-non-justifiees'),
    path('api/etudiant/justificatifs/', JustificatifEtudiantView.as_view(), name='etudiant-justificatifs'),
    path('api/enseignant/dashboard/', EnseignantDashboardView.as_view(), name='enseignant-dashboard'),
    path('api/enseignant/seance/<str:seance_id>/', SeanceAppelView.as_view(), name='seance-appel'),
    path('api/enseignant/presences/bulk/', PresenceBulkUpdateView.as_view(), name='presence-bulk-update'),
    path('api/enseignant/attendance-evolution/', EnseignantAttendanceEvolutionView.as_view(), name='attendance-evolution'),
    path('api/enseignant/statistics/', EnseignantStatisticsView.as_view(), name='enseignant-statistics'),
    path('api/enseignant/justificatifs/', EnseignantJustificatifsView.as_view(), name='enseignant-justificatifs'),
    path('api/enseignant/justificatifs/<str:justificatif_id>/traiter/', TraiterJustificatifView.as_view(), name='traiter-justificatif'),
    path('api/admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('api/admin/statistics/', AdminStatisticsView.as_view(), name='admin-statistics'),
    path('api/admin/eliminations/', EliminationsAdminView.as_view(), name='admin-eliminations'),
    path('api/admin/eliminations/<str:elimination_id>/confirmer/', ConfirmerEliminationView.as_view(), name='confirmer-elimination'),
    path('api/admin/eliminations/<str:elimination_id>/annuler/', AnnulerEliminationView.as_view(), name='annuler-elimination'),
    path('api/admin/eliminations/detecter/', DetecterEliminationsView.as_view(), name='detecter-eliminations'),
    path('api/admin/eliminations/<str:elimination_id>/notifier/', NotifierEtudiantView.as_view(), name='notifier-etudiant'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
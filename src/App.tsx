/**
 * Application router definition.
 * Declares application routes and wraps them with the shared AppLayout shell.
 */
import { lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import RulesChapterPage from './pages/RulesChapterPage';
import UnitsPage from './pages/UnitsPage';
import UnitFullPage from './pages/UnitFullPage';
import UnitComparePage from './pages/UnitComparePage';
import WeaponFullPage from './pages/WeaponFullPage';
import CampaignPage from './pages/CampaignPage';
import WikiPage from './pages/WikiPage';
import WikiArticlePage from './pages/WikiArticlePage';
import { DisplaySettingsProvider } from './hooks/useDisplaySettings';

const ArmyBuilderPage = lazy(() => import('./pages/ArmyBuilderPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const CompanyDetailPage = lazy(() => import('./pages/CompanyDetailPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'rules', element: <Navigate to="/rules/introduction" replace /> },
      { path: 'rules/:chapterId', element: <RulesChapterPage /> },
      { path: 'rules/:chapterId/:subchapterId', element: <RulesChapterPage /> },
      { path: 'units', element: <UnitsPage /> },
      { path: 'units/:unitId/compare/:compareUnitId', element: <UnitComparePage /> },
      { path: 'units/:unitId', element: <UnitFullPage /> },
      { path: 'weapons/:weaponId', element: <WeaponFullPage /> },
      { path: 'army-builder', element: <ArmyBuilderPage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'companies/:companyId', element: <CompanyDetailPage /> },
      { path: 'company-editor', element: <Navigate to="/companies" replace /> },
      { path: 'campaign', element: <CampaignPage /> },
      { path: 'wiki', element: <WikiPage /> },
      { path: 'wiki/:articleId', element: <WikiArticlePage /> },
    ],
  },
]);

export default function App() {
  return (
    <DisplaySettingsProvider>
      <RouterProvider router={router} />
    </DisplaySettingsProvider>
  );
}

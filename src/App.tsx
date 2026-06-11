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
import CampaignPage from './pages/CampaignPage';
import WikiPage from './pages/WikiPage';
import WikiArticlePage from './pages/WikiArticlePage';

const ArmyBuilderPage = lazy(() => import('./pages/ArmyBuilderPage'));

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
      { path: 'army-builder', element: <ArmyBuilderPage /> },
      { path: 'campaign', element: <CampaignPage /> },
      { path: 'wiki', element: <WikiPage /> },
      { path: 'wiki/:articleId', element: <WikiArticlePage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

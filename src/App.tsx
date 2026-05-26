/**
 * Application router definition.
 * Declares application routes and wraps them with the shared AppLayout shell.
 */
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import RulesPage from './pages/RulesPage';
import RulesChapterPage from './pages/RulesChapterPage';
import UnitsPage from './pages/UnitsPage';
import ArmyBuilderPage from './pages/ArmyBuilderPage';
import CampaignPage from './pages/CampaignPage';
import WikiPage from './pages/WikiPage';
import WikiArticlePage from './pages/WikiArticlePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'rules', element: <RulesPage /> },
      { path: 'rules/:chapterId', element: <RulesChapterPage /> },
      { path: 'units', element: <UnitsPage /> },
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

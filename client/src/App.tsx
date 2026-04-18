import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  return null;
}
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Magazine from "./pages/Magazine";
import ArticlePage from "./pages/ArticlePage";
import Directory from "./pages/Directory";
import Investments from "./pages/Investments";
import Bids from "./pages/Bids";
import Events from "./pages/Events";
import Subscriptions from "./pages/Subscriptions";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminArticleForm from "./pages/admin/AdminArticleForm";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminContact from "./pages/admin/AdminContact";
import AdminMagazine from "./pages/admin/AdminMagazine";
import AdminOpportunities from "./pages/admin/AdminOpportunities";
import AdminOpportunityForm from "./pages/admin/AdminOpportunityForm";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAuthors from "./pages/admin/AdminAuthors";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminNotifications from "./pages/admin/AdminNotifications";
import About from "./pages/About";
import MyAccount from "./pages/MyAccount";
import Downloads from "./pages/Downloads";
import Archives from "./pages/Archives";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Green from "./pages/Green";
import GreenCarbone from "./pages/GreenCarbone";
import GreenForets from "./pages/GreenForets";
import GreenEnergie from "./pages/GreenEnergie";
import GreenFinance from "./pages/GreenFinance";
import GreenActeurs from "./pages/GreenActeurs";
import GreenRessources from "./pages/GreenRessources";
import Partners from "./pages/Partners";
import SearchPage from "./pages/Search";

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path={"/"} component={Home} />
      <Route path={"/magazine"} component={Magazine} />
      <Route path={"/article/:slug"} component={ArticlePage} />
      <Route path={"/annuaire"} component={Directory} />
      <Route path={"/investisseurs"} component={Investments} />
      <Route path={"/appels-offres"} component={Bids} />
      <Route path={"/evenements"} component={Events} />
      <Route path={"/abonnements"} component={Subscriptions} />
      <Route path={"/a-propos"} component={About} />
      <Route path={"/telecharger"} component={Downloads} />
      <Route path={"/archives"} component={Archives} />
      <Route path={"/inscription"} component={Registration} />
      <Route path={"/login"} component={Login} />
      <Route path={"/mot-de-passe-oublie"} component={ForgotPassword} />
      <Route path={"/reinitialiser-mot-de-passe"} component={ResetPassword} />
      <Route path={"/partenaires"} component={Partners} />
      <Route path={"/recherche"} component={SearchPage} />

      {/* Green pages */}
      <Route path={"/green"} component={Green} />
      <Route path={"/green/carbone"} component={GreenCarbone} />
      <Route path={"/green/forets"} component={GreenForets} />
      <Route path={"/green/energie"} component={GreenEnergie} />
      <Route path={"/green/finance"} component={GreenFinance} />
      <Route path={"/green/acteurs"} component={GreenActeurs} />
      <Route path={"/green/ressources"} component={GreenRessources} />
      <Route path={"/mon-compte"} component={MyAccount} />
      <Route path={"/espace-membre"} component={Dashboard} />

      {/* Admin pages */}
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/articles"} component={AdminArticles} />
      <Route path={"/admin/articles/nouveau"} component={AdminArticleForm} />
      <Route path={"/admin/articles/:id"} component={AdminArticleForm} />
      <Route path={"/admin/utilisateurs"} component={AdminUsers} />
      <Route path={"/admin/newsletter"} component={AdminNewsletter} />
      <Route path={"/admin/magazine"} component={AdminMagazine} />
      <Route path={"/admin/messages"} component={AdminContact} />
      <Route path={"/admin/opportunites"} component={AdminOpportunities} />
      <Route path={"/admin/opportunites/nouveau"} component={AdminOpportunityForm} />
      <Route path={"/admin/opportunites/:id"} component={AdminOpportunityForm} />
      <Route path={"/admin/parametres"} component={AdminSettings} />
      <Route path={"/admin/auteurs"} component={AdminAuthors} />
      <Route path={"/admin/evenements"} component={AdminEvents} />
      <Route path={"/admin/notifications"} component={AdminNotifications} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

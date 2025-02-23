import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { Layout } from "@/components/layout";
import ProjectInput from "@/pages/project-input";
import Configuration from "@/pages/configuration";
import Templates from "@/pages/templates";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={ProjectInput} />
        <Route path="/project/new" component={ProjectInput} />
        <Route path="/project/:id/configuration" component={Configuration} />
        <Route path="/project/:id/templates" component={Templates} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
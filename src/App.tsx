import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import VideoPage from "./pages/VideoPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <VideoPage />
    </QueryClientProvider>
  );
}

export default App;

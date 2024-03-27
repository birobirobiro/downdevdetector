import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./components/ui/card";
import { ScrollArea } from "./components/ui/scroll-area";
import { websites } from "@/data/sites";
import { Skeleton } from "./components/ui/skeleton";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";

type Component = {
  id: string;
  name: string;
  url: string;
  status: string;
};

type Status = {
  indicator: string;
  description: string;
};

type Page = {
  id: string;
  name: string;
  url: string;
  status: string;
  updated_at: string;
};

type IncidentsProps = {
  components: Component[];
  status: Status;
  page: Page;
};

function App() {
  const [websiteData, setWebsiteData] = useState<IncidentsProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await Promise.all(
          websites.map((website) => getStatus(website.url))
        );
        const sortedData = data.sort((a, b) => 
          a.page.name.localeCompare(b.page.name)
        );
        // console.log(data);
        setWebsiteData(sortedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getStatus = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting status:", error);
      return { status: { description: "Error fetching status" } };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-500";
      case "unstable":
        return "text-yellow-500";
      case "degraded_performance":
        return "text-yellow-500";
      case "partial_outage":
        return "text-orange-500";
      case "major_outage":
        return "text-red-500";
      case "down":
        return "text-red-500";
      case "under_maintenance":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <main className="flex flex-col items-center justify-center w-full h-full py-20 px-10 overflow-y-auto">
        <div className="flex flex-col text-center mb-10 gap-3">
          <h1 className="text-2xl md:text-3xl font-bold">DownDevDetector</h1>

          <span className="text-sm md:text-base">
            This app lists all the services currently down and uses service{" "}
            <a
              className="underline text-muted-foreground"
              href="https://status.atlassian.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Atlassian Status Page
            </a>{" "}
            and others (soon).
          </span>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="text-green-500 text-xs md:text-sm">Operational</Badge>
            <Badge variant="outline" className="text-yellow-500 text-xs md:text-sm">Unstable</Badge>
            <Badge variant="outline" className="text-red-500 text-xs md:text-sm">Down</Badge>
            <Badge variant="outline" className="text-orange-500 text-xs md:text-sm">Partial Outage</Badge>
            <Badge variant="outline" className="text-blue-500 text-xs md:text-sm">Under Maintenance</Badge>
          </div>

          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full mx-auto mt-5"
          />
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 w-full h-full items-center">
          {websiteData
            .filter((data) =>
              data.page.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((website) => (
              <div key={website.page.id}>
                {loading ? (
                  <Skeleton>
                    <Card className="w-80 h-80" key={website.page.id}>
                      <CardHeader>
                        <CardTitle className="text-lg font-bold">
                          {website.page.name}
                        </CardTitle>
                        <CardDescription className="mb-2">
                          <Skeleton className="h-4 w-full" />
                        </CardDescription>
                        <CardContent className="flex flex-col gap-5 w-full h-full">
                          <ScrollArea className="h-80">
                            <ul className="flex flex-col w-full h-full justify-between gap-5">
                              <li>
                                <Skeleton className="h-4" />
                              </li>
                              <li>
                                <Skeleton className="h-4" />
                              </li>
                              <li>
                                <Skeleton className="h-4" />
                              </li>
                              <li>
                                <Skeleton className="h-4" />
                              </li>
                              <li>
                                <Skeleton className="h-4" />
                              </li>
                            </ul>
                          </ScrollArea>
                          <CardFooter className="mt-2">
                            <Skeleton className="h-4 w-1/2" />
                          </CardFooter>
                        </CardContent>
                      </CardHeader>
                    </Card>
                  </Skeleton>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">
                        {website.page.name}
                      </CardTitle>
                      <CardDescription
                        className={`${getStatusColor(website.status.indicator)} mb-2`}
                      >
                        {website.status.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-80">
                      <ul>
                        {website.components.map((component) => (
                          <li key={component.id}>
                            <div
                              className={`${getStatusColor(component.status)} flex gap-2 items-center`}
                            >
                              <p>{component.name}</p> - <p>{component.status}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                      </ScrollArea>

                      <CardFooter className="justify-center mt-2">
                        <p className="text-muted-foreground text-center">
                          Last updated:{" "}
                          {new Date(website.page.updated_at).toLocaleString("en-US")}
                        </p>
                      </CardFooter>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
        </div>

        {websites.filter((website) =>
          website.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0 && (
            <div className="flex flex-col gap-2 items-center">
              <span className="text-center text-red-500 mx-auto">
                No results found for:
              </span>

              <span className="text-center text-red-500 font-bold">{searchQuery}</span>
            </div>
          )}

        <footer className="mt-10">
          <p className="text-center text-muted-foreground">
            <a
              href="https://birobirobiro.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              birobirobiro.dev
            </a>
          </p>
        </footer>
      </main>
    </ThemeProvider>
  );
}

export default App;

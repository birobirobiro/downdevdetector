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

type Component = {
  id: string;
  name: string;
  url: string;
  status: string;
}

type Status = {
  indicator: string;
  description: string;
}

type Page = {
  id: string;
  name: string;
  url: string;
  status: string;
  updated_at: string;
}

type IncidentsProps = {
  components: Component[];
  status: Status;
  page: Page;
}

function App() {
  const [websiteData, setWebsiteData] = useState<IncidentsProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await Promise.all(
          websites.map((website) => getStatus(website.url))
        );
        console.log(data);
        setWebsiteData(data);
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
      <main className="flex flex-col items-center justify-center h-full py-20 px-10">
        <div className="flex flex-col text-center mb-10 gap-2">
          <h1 className="text-3xl font-bold">DownDevDetector</h1>

          <span>
            This app list all the services that are currently down and use
            service{"  "}
            <a
              className="underline text-muted-foreground"
              href="https://status.atlassian.com/"
              target="_blank"
            >
              Atlassian Status Page
            </a>{"  "}
            and others (soon).
          </span>

          <div className="flex gap-2 items-center justify-center">
            <span className="text-green-500">Operational</span>
            <span className="text-yellow-500">Unstable</span>
            <span className="text-red-500">Down</span>
            <span className="text-orange-500">Partial Outage</span>
            <span className="text-blue-500">Under Maintenance</span>
          </div>

        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {websites.map((website, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  {website.name}
                </CardTitle>
                <CardDescription
                  className={`${websiteData[index]?.status.description === "All Systems Operational"
                    ? "text-green-500"
                    : websiteData[index]?.status.description === "Major System Outage"
                      ? "text-red-500"
                      : websiteData[index]?.status.description === "Partial System Outage" ||
                        websiteData[index]?.status.description === "Degraded System Service" ||
                        websiteData[index]?.status.description === "Partially Degraded Service"
                        ? "text-orange-500"
                        : websiteData[index]?.status.description === "Minor Service Outage"
                          ? "text-yellow-500"
                          : websiteData[index]?.status.description === "Service Under Maintenance"
                            ? "text-blue-500"
                            : ""
                    }`}
                >
                  {websiteData[index]?.status.description}
                </CardDescription>

              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <ul>
                    {websiteData[index]?.components.map((component) => (
                      <li key={component.id}>
                        {loading ? (
                          <Skeleton className="h-6 w-full flex gap-4 flex-col my-2" />
                        ) : (
                          <div
                            className={`
            ${getStatusColor(component.status)}
            flex gap-2 items-center
            `}
                          >
                            <p>{component.name}</p>
                            -
                            <p>{component.status}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>

                <CardFooter className="justify-center mt-2">
                  <p className="text-muted-foreground text-center">
                    Last updated:{" "}
                    {new Date(
                      websiteData[index]?.page.updated_at
                    ).toLocaleString("en-US")}
                  </p>
                </CardFooter>
              </CardContent>
            </Card>
          ))}
        </div>

        <footer className="mt-10">
          <p className="text-center text-muted-foreground">
            <a href="https://birobirobiro.dev" target="_blank">
              birobirobiro.dev
            </a>
          </p>
        </footer>
      </main>
    </ThemeProvider>
  );
}

export default App;

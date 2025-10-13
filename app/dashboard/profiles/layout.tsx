import { GoogleMapsProvider } from "../../google-maps-provider";

export default function ProfilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleMapsProvider>
      {children}
    </GoogleMapsProvider>
  );
}

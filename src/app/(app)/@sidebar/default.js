import { AppSidebar } from "@/components/app/sidebare/app-sidebar";

// Ce fichier est requis pour les parallel routes Next.js
// Il gère les cas où le slot @sidebar n'est pas matché
export default function DefaultSidebar() {
    return <AppSidebar section="default" />;
}
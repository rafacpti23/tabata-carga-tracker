
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Login() {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-900 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="p-4 sm:p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="https://tobematransportadora.com.br/wp-content/uploads/2020/02/logo-do-rodape.png" 
              alt="Logo Tobema Transportes" 
              className="h-20 w-auto"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/200x100/tabata/white?text=Tobema";
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Tobema Transportes</h1>
          <p className="text-gray-200">Sistema de Controle de Cargas</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}

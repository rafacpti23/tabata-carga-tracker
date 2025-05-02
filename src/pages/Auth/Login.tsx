
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tabata-50 to-cargo-50">
      <div className="p-4 sm:p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="https://tobematransportadora.com.br/wp-content/uploads/2020/02/logo-do-rodape.png" 
              alt="Logo Tabata Transportes" 
              className="h-20 w-auto"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/200x100/tabata/white?text=Tabata";
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-tabata-800 mb-2">Tabata Transportes</h1>
          <p className="text-gray-600">Sistema de Controle de Cargas</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-tabata-800 text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Tabata Transportes</h1>
          </div>
          <div>
            <Button asChild variant="outline" className="text-white border-white hover:bg-tabata-700">
              <Link to="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-b from-tabata-50 to-cargo-50">
        <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold text-tabata-800 mb-4">
              Sistema de Controle de Carga e Descarga
            </h2>
            <p className="text-lg mb-6 text-gray-700">
              Gerencie suas cargas e motoristas de forma eficiente com o sistema completo da Tabata Transportes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-tabata-600 hover:bg-tabata-700">
                <Link to="/login">Acessar Sistema</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-tabata-600 text-tabata-600 hover:bg-tabata-50">
                <a href="#features">Saber Mais</a>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <div className="bg-tabata-100 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-tabata-800 mb-2">Sistema Integrado</h3>
                <p className="text-gray-600">
                  Controle de motoristas e cargas em tempo real com integração WhatsApp.
                </p>
              </div>
              <div className="bg-cargo-100 p-4 rounded-lg">
                <h3 className="font-medium text-cargo-800 mb-2">Monitoramento em Tempo Real</h3>
                <p className="text-gray-600">
                  Acompanhe a localização dos motoristas e o status das entregas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Principais Recursos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <div className="h-12 w-12 rounded-full bg-tabata-100 text-tabata-800 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><path d="M9 16h6"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dashboard Intuitivo</h3>
              <p className="text-gray-600">
                Visualize todas as informações importantes em um único lugar, com interfaces amigáveis e dados em tempo real.
              </p>
            </div>
            
            <div className="p-6 border rounded-lg">
              <div className="h-12 w-12 rounded-full bg-cargo-100 text-cargo-800 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Geolocalização</h3>
              <p className="text-gray-600">
                Acompanhe seus motoristas no mapa e saiba exatamente onde estão suas cargas a qualquer momento.
              </p>
            </div>
            
            <div className="p-6 border rounded-lg">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3v18"></path><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M21 9H3"></path><path d="M21 15H3"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Integração com WhatsApp</h3>
              <p className="text-gray-600">
                Receba atualizações dos motoristas diretamente pelo WhatsApp e mantenha seu sistema sempre atualizado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} Tabata Transportes. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

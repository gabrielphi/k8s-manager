import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="container mx-auto px-4 py-16 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Kubernetes Manager
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Gerencie seu cluster Kubernetes de forma simplificada
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/pods"
              className="group bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4 group-hover:bg-blue-500 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-300 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Pods
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Visualize e gerencie os pods do seu cluster
              </p>
            </Link>

            <Link
              to="/create"
              className="group bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-400"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4 group-hover:bg-green-500 transition-colors">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-300 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Criar Recursos
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Crie pods, deployments, secrets, ingress e namespaces
              </p>
            </Link>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 opacity-50">
              <div className="flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg mb-4">
                <svg
                  className="w-6 h-6 text-slate-400 dark:text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Deployments
              </h2>
              <p className="text-slate-600 dark:text-slate-400">Em breve</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 opacity-50">
              <div className="flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg mb-4">
                <svg
                  className="w-6 h-6 text-slate-400 dark:text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Secrets
              </h2>
              <p className="text-slate-600 dark:text-slate-400">Em breve</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

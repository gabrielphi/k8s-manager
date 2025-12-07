import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">K8s Manager</h1>
      <p className="mb-4">
        A simplified way to manage your Kubernetes cluster.
      </p>
      <div className="flex space-x-4">
        <Link to="/pods" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          List Pods
        </Link>
        <Link to="/create" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Create Resource
        </Link>
      </div>
    </div>
  );
}

export default Home;

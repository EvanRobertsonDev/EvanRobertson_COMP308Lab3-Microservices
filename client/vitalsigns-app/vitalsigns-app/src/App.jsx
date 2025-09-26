// vitalsigns-app/src/App.jsx
import './App.css';
import VitalComponent from './VitalComponent';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
const client = new ApolloClient({
uri: 'http://localhost:4002/graphql', // Set this to your actual GraphQL endpoint
cache: new InMemoryCache(),
credentials: 'include'
});
function App() {
return (
<div className='App'>
<ApolloProvider client={client}>
<VitalComponent />
</ApolloProvider>
</div>
);
}
export default App;
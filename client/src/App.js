import React from 'react';
import gql from 'graphql-tag';

import { useLazyQuery } from '@apollo/react-hooks';

const GET_ALL = /* GraphQL */ gql`
  {
    Authors {
      name
      books {
        title
      }
    }
  }
`;

function App() {
  const [loadData, { loading, data, error }] = useLazyQuery(GET_ALL);

  const render = () => {
    if (loading) {
      return <p>Loading...</p>;
    }
    if (error) {
      return <p>Error, try again</p>;
    }
    return <Data value={data} />;
  };

  return (
    <div>
      <input type="button" value="Load data" onClick={loadData} />
      {render()}
    </div>
  );
}

function Data({ value }) {
  return <pre>{JSON.stringify(value, null, 2)}</pre>;
}

export default App;

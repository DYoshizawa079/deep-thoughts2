import React from 'react';
import { useQuery } from '@apollo/client';
import { QUERY_THOUGHTS } from '../utils/queries';

import ThoughtList from '../components/ThoughtList';

const Home = () => {
  // 'loading' property is provided by the library to indicate that the request is still loading
  // 'data' property contains the data that finished loading from the API
  const { loading, data } = useQuery(QUERY_THOUGHTS);

  const thoughts = data?.thoughts || [];
  console.log(thoughts);

  return (
    <main>
      <div className='flex-row justify-space-between'>
        <div className='col-12 mb-3'>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ThoughtList thoughts={thoughts} title="Some Feed for Thoughts..." />
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;

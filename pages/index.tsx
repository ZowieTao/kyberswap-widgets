import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Opencord Kyberswap Widgets Plugin</title>
        <meta
          name="description"
          content="opencord plugin for kyberswap widgets"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="p-8 px-4 sm:px-8 py-2 sm:py-3 bg-sky-700 hover:bg-sky-800">
          tailwind is shit
        </h1>

        <code className="rounded-md bg-gray-100 p-3 font-mono text-lg">
          pages/index.tsx
        </code>
      </main>
    </>
  );
};

export default Home;

import Head from 'next/head';

export function AppHead(): JSX.Element {
  return (
    <Head>
      <title>DeadCaster</title>
      <meta name='og:title' content='DeadCaster' />
      <link rel='icon' href='/favicon.ico' />
      <link rel='manifest' href='/site.webmanifest' key='site-manifest' />
      <meta name='twitter:site' content='@DeadCaster' />
    </Head>
  );
}

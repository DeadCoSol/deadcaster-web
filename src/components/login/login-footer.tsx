const footerLinks = [
  ['About', 'https://deadcaster.xyz/about'],
  ['Help Center', 'https://deadcaster.xyz/help'],
  ['Privacy Policy', 'https://deadcaster.xyz/tos'],
  ['Cookie Policy', 'https://deadcaster.xyz/cookies'],
  ['Accessibility', 'https://deadcaster.xyz/accessibility']
] as const;

export function LoginFooter(): JSX.Element {
  return (
    <footer className='hidden justify-center p-4 text-sm text-light-secondary dark:text-dark-secondary lg:flex'>
      <nav className='flex flex-wrap justify-center gap-4 gap-y-2'>
        {footerLinks.map(([linkName, href]) => (
          <a
            className='custom-underline'
            target='_blank'
            rel='noreferrer'
            href={href}
            key={linkName}
          >
            {linkName}
          </a>
        ))}
        <p>© 2022 Buckshot Technologies, LLC.</p>
      </nav>
    </footer>
  );
}

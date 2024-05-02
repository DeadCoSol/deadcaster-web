const footerLinks = [
  ['About', 'https://about.twitter.com'],
  ['Help Center', 'https://help.twitter.com'],
  ['Privacy Policy', 'https://twitter.com/tos'],
  ['Cookie Policy', 'https://support.twitter.com/articles/20170514'],
  ['Accessibility', 'https://help.twitter.com/resources/accessibility'],
  ['Blog', 'https://blog.twitter.com'],
  ['Status', 'https://status.twitterstat.us'],
  ['Careers', 'https://careers.twitter.com'],
  ['Developers', 'https://developer.twitter.com']
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

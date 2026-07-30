import Link from 'next/link';
import { redirect } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Footer } from '@/components/ui';
import LoginForm from './LoginForm';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';

export const metadata = { title: 'Connexion' };

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect('/library');

  const { t } = await getT();

  return (
    <>
      <Chrome />
      <div className="page" style={{ maxWidth: 460 }}>
        <h1 className="section_title" style={{ fontSize: 17 }}>
          {t('auth_login_title')}
        </h1>
        <div className="panel_solid">
          <LoginForm
            labels={{
              handle: t('auth_handle'),
              password: t('auth_password'),
              submit: t('auth_submit_login'),
            }}
          />
        </div>
        <p className="tiny muted" style={{ marginTop: 14 }}>
          {t('auth_no_account')} <Link href="/register">{t('nav_register')}</Link>
        </p>
        <p className="tiny faint" style={{ marginTop: 6 }}>
          {t('auth_demo_hint', { accounts: 'aurore, malik, jun, theo, ines', password: 'steamder123' })}
        </p>
      </div>
      <Footer t={t} />
    </>
  );
}

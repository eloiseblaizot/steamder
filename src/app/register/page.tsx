import Link from 'next/link';
import { redirect } from 'next/navigation';
import Chrome from '@/components/Chrome';
import { Footer } from '@/components/ui';
import RegisterForm from './RegisterForm';
import { currentUser } from '@/lib/session';
import { getT } from '@/lib/lang';

export const metadata = { title: 'Inscription' };

export default async function RegisterPage() {
  const user = await currentUser();
  if (user) redirect('/library');

  const { t } = await getT();

  return (
    <>
      <Chrome />
      <div className="page" style={{ maxWidth: 460 }}>
        <h1 className="section_title" style={{ fontSize: 17 }}>
          {t('auth_register_title')}
        </h1>
        <div className="panel_solid">
          <RegisterForm
            labels={{
              handle: t('auth_handle'),
              handleHint: t('auth_handle_hint'),
              displayName: t('auth_display_name'),
              password: t('auth_password'),
              passwordHint: t('auth_password_hint'),
              confirm: t('auth_password_confirm'),
              submit: t('auth_submit_register'),
            }}
          />
        </div>
        <p className="tiny muted" style={{ marginTop: 14 }}>
          {t('auth_have_account')} <Link href="/login">{t('nav_login')}</Link>
        </p>
      </div>
      <Footer t={t} />
    </>
  );
}

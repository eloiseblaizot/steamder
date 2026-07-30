import Link from 'next/link';
import Chrome from '@/components/Chrome';
import { Footer } from '@/components/ui';
import { getT } from '@/lib/lang';

export default async function NotFound() {
  const { t } = await getT();

  return (
    <>
      <Chrome />
      <div className="page">
        <div className="panel_solid empty_state">
          <h3>{t('g_not_found')}</h3>
          <p style={{ marginBottom: 16 }}>{t('g_not_found_body')}</p>
          <Link href="/" className="btn btn_primary">
            {t('nav_store')}
          </Link>
        </div>
      </div>
      <Footer t={t} />
    </>
  );
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Approval Home',
  description:
    'Static approval prototype for the imported landing page before CMS integration.',
};

export default function ApprovalHomePage() {
  redirect('/');
}

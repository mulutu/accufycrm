import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    // Generate the embed code
    const embedCode = `
<!-- AI Chat CRM Widget -->
<script>
  window.AI_CHAT_CRM_CONFIG = {
    chatbotId: "${chatbot.id}",
    name: "${chatbot.name}",
    logoUrl: "${chatbot.logoUrl || ''}",
    avatarUrl: "${chatbot.avatarUrl || ''}",
    theme: "light"
  };
</script>
<script src="${process.env.NEXTAUTH_URL}/widget.js"></script>
`;

    return NextResponse.json({ embedCode });
  } catch (error) {
    console.error('Error generating embed code:', error);
    return NextResponse.json(
      { error: 'Failed to generate embed code' },
      { status: 500 }
    );
  }
} 
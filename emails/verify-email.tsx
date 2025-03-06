import {
  Button,
  Container,
  Font,
  Head,
  Html,
  Tailwind,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface EmailTemplateProps {
  email: string
  uuid: string
  eventName: string
  slug: string
}

export default function EmailTemplate(props: Readonly<EmailTemplateProps>) {
  const {
    email = 'email@example.com',
    uuid = 'c031d415-29de-418f-8948-e64e0bb8cb4e',
    eventName = 'Event Name',
    slug = 'event-slug',
  } = props

  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Tailwind>
        <Container className="border border-[#e9e9e9] bg-[#F9FAFB] rounded-lg overflow-clip w-[550px]">
          <Container className="p-[20px]">
            <Text className="text-[14px]">Hey there! 👋</Text>
            <Text className="text-[14px]">
              Thanks for signing up to get a reminder for our upcoming event,{' '}
              <strong>{eventName}</strong>!
            </Text>
            <Text className="text-[14px]">
              One more thing: <strong>please click the button below</strong> to
              confirm your email address and recieve the reminder.
            </Text>
            <Button
              className="bg-[#FBBF24] p-[20px] rounded-xl text-black visited:text-black"
              href={`https://events.purduehackers.com/api/addToMailingList?list=${slug}&email=${email}&eventName=${eventName}&uuid=${uuid}`}
            >
              <strong>Confirm Email Address</strong>
            </Button>
            <Text>💛 Purdue Hackers</Text>
            <Text>
              (If you don&apos;t know why you&apos;re recieving this email,
              don&apos;t click that button & you won&apos;t get any emails from
              us.)
            </Text>
          </Container>
        </Container>
      </Tailwind>
    </Html>
  )
}

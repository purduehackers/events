import {
  Container,
  Font,
  Head,
  Html,
  Tailwind,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface EmailTemplateProps {
  state: 'tomorrow' | 'today'
  event: {
    name: string
    date: string
    location: string
  }
}

export default function EmailTemplate(props: Readonly<EmailTemplateProps>) {
  const {
    state = 'tomorrow',
    event = {
      name: 'something',
      date: 'some time',
      location: 'some location',
    },
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
          <Container className="bg-[#FBBF24]">
            <Text className="w-full text-center text-[16px]">
              <strong>
                {state === 'today' && '‼️'} Reminder: {event.name} is happening{' '}
                {state}! {state === 'today' && '🗓️'}
              </strong>
            </Text>
          </Container>
          <Container className="px-[20px]">
            <Text className="text-[14px]">Hey there! 👋</Text>
            <Text className="text-[14px]">
              You signed up to receive an email reminder for Purdue
              Hackers&apos; upcoming event, {event.name}.{' '}
              {state === 'tomorrow' ? (
                <>
                  We&apos;re reaching out to remind you that it&apos;s happening{' '}
                  <strong>
                    TOMORROW: {event.date} at {event.location}
                  </strong>
                </>
              ) : (
                <>
                  This is a final reminder that this event is happening{' '}
                  <strong>
                    in just a few hours: {event.date} at {event.location}
                  </strong>
                </>
              )}
              .
            </Text>
            <Text className="text-[14px]">
              If we can answer any questions, just reply to this email and
              we&apos;ll get back to you soon. Hope to see you there :)
            </Text>
            <Text>💛 Purdue Hackers</Text>
          </Container>
        </Container>
      </Tailwind>
    </Html>
  )
}

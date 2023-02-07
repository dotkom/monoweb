import { Button } from "@dotkomonline/ui"
import { useSession, signOut } from "next-auth/react"
import React from "react"
import { useTheme } from "next-themes"

const Home: React.FC = () => {
  const { data: session, status } = useSession()
  const { setTheme } = useTheme()
  if (session) {
    return (
      <div>
        {status}
        {JSON.stringify(session)}
        <Button onClick={() => signOut()}>Sign out</Button>
      </div>
    )
  }

  return (
    <div>
      Not signed in <br />
      <Button onClick={() => setTheme("dark")}>Make it dark</Button>
      <Button onClick={() => setTheme("light")}>Make it light</Button>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse efficitur mollis lacus eu suscipit. Fusce
      consequat justo eget suscipit fermentum. Etiam aliquet nibh vel augue egestas porttitor. Fusce molestie laoreet
      nisl, at dignissim turpis consectetur eu. Interdm et malesuada fames ac ante ipsum primis in faucibus. Curabitur
      nibh dolor, tempus eget pretium et, accumsan vitae lorem. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Donec pellentesque ligula neque, a convallis lectus dapibus sit amet. Sed facilisis arcu purus, non pharetra metus
      convallis a. Fusce sed ligula sed nibh egestas dignissim. Vivamus at ante finibus, dignissim velit sed, imperdiet
      erat. Integer vitae suscipit leo. Vestibulum ut vestibulum velit, non sollicitudin mauris. Duis nisl tortor,
      rhoncus ut mollis vel, pharetra consectetur mi. In sem nisl, ultrices ut felis et, interdum interdum arcu. Etiam
      vehicula posuere rhoncus. Sed sed felis elit. Donec in aliquet ante. Sed vitae nisi ut tortor consequat rutrum.
      Etiam at risus sed tellus tincidunt lacinia eu ut tortor. Pellentesque eros ipsum, iaculis a magna nec, auctor
      ornare lacus. Nulla facilisi. In faucibus hendrerit nisi id sollicitudin. Proin sed bibendum purus. Suspendisse
      ipsum lectus, pharetra eget augue gravida, semper fermentum dolor. Fusce cursus placerat erat, ultrices imperdiet
      nisi hendrerit ut. Ut sit amet elementum nunc. Donec massa neque, convallis in eros sed, elementum bibendum metus.
      Etiam pretium cursus porta. Donec orci enim, imperdiet id augue vel, faucibus rhoncus dolor. Duis scelerisque
      dolor augue, commodo auctor dui malesuada at. Curabitur a arcu urna. Curabitur metus felis, commodo et posuere et,
      venenatis nec dolor. Nam eget orci sit amet erat aliquet vestibulum. Vestibulum pellentesque felis nec lectus
      dignissim, pharetra elementum dolor condimentum. Praesent scelerisque egestas euismod. Phasellus ornare, nisl eget
      aliquam dapibus, orci diam tincidunt tellus, ut congue dolor orci a massa. Vestibulum id pretium sem, non
      pellentesque diam. Suspendisse semper, dui id fringilla euismod, justo odio commodo ex, sit amet suscipit justo
      lacus vel lorem. Nunc imperdiet tempor purus, eu facilisis tellus rutrum ac. Fusce varius eu massa ac eleifend.
      Praesent tempus, nisl at vestibulum porta, libero purus suscipit augue, eu pellentesque leo diam in nibh. Cras sit
      amet sodales augue. Fusce nec dignissim arcu. Curabitur laoreet purus nulla, id molestie turpis laoreet nec. Nam
      congue dignissim sollicitudin. Curabitur consectetur sapien ut est semper mollis. Nam euismod nunc non elit
      pretium, ac mollis tellus lobortis. Cras turpis urna, aliquet non efficitur rutrum, posuere eget justo. Vivamus
      tincidunt risus ligula, nec viverra neque vulputate non. Pellentesque augue felis, posuere sed neque ut, lobortis
      dignissim risus. Maecenas faucibus risus a hendrerit ultricies. Etiam sed fermentum orci. Phasellus et risus nec
      turpis dapibus rutrum. Aenean sed nunc at sem rutrum scelerisque nec vitae diam. Aliquam porttitor mauris ligula,
      in tristique urna dapibus vitae. Integer rutrum quam dui, ac finibus tortor fermentum feugiat. Donec posuere
      interdum commodo. Curabitur venenatis lectus nec sapien tristique convallis. Nullam sodales pellentesque diam, vel
      dapibus arcu vulputate quis. Sed blandit augue sed felis cursus mollis. Maecenas blandit vitae elit auctor
      pellentesque. Ut fringilla mauris lectus, vel ultricies est iaculis ut. Suspendisse egestas eget nulla sed
      dignissim.
    </div>
  )
}

export default Home

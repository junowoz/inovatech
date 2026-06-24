import { UserPlus } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MembrosMensagem() {
  return (
    <Alert className="mb-4">
      <UserPlus />
      <AlertTitle>Adicione membros e fundadores do projeto</AlertTitle>
      <AlertDescription>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            Insira os nomes dos <em>membros</em> separados por vírgulas, Enter ou
            colando uma lista com os nomes.
          </li>
          <li>
            Adicione os <em>fundadores</em> preenchendo os campos &quot;Nome&quot;
            e &quot;LinkedIn ou Email&quot; e selecionando &quot;Fundador&quot; ou
            &quot;Cofundador&quot;.
          </li>
        </ul>
        <p>
          Fundadores são responsáveis pelo projeto, enquanto membros são outros
          integrantes que contribuem.
        </p>
      </AlertDescription>
    </Alert>
  );
}

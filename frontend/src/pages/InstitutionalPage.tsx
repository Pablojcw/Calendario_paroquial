import { useQuery } from '@tanstack/react-query';
import { api } from '../api/endpoints.js';
import { Spinner } from '../components/Spinner.js';

export function InstitutionalPage() {
  const query = useQuery({ queryKey: ['institution'], queryFn: api.getInstitution });

  if (query.isLoading) return <Spinner />;
  if (query.isError) {
    return (
      <div>
        <h2 className="page-title">A paróquia</h2>
        <p className="empty">Não foi possível carregar as informações institucionais.</p>
      </div>
    );
  }

  const info = query.data!;

  return (
    <div className="institution">
      <h2 className="page-title">{info.nome}</h2>
      <p className="page-subtitle">Paróquia Nossa Senhora de Fátima e São Francisco de Paula</p>

      <div className="details">
        <dl>
          {info.endereco && (
            <>
              <dt>Endereço</dt>
              <dd>{info.endereco}</dd>
            </>
          )}
          {info.telefone && (
            <>
              <dt>Telefone</dt>
              <dd>{info.telefone}</dd>
            </>
          )}
          {info.whatsapp && (
            <>
              <dt>WhatsApp</dt>
              <dd>{info.whatsapp}</dd>
            </>
          )}
          {info.email && (
            <>
              <dt>E-mail</dt>
              <dd>{info.email}</dd>
            </>
          )}
          {info.expediente && (
            <>
              <dt>Expediente da secretaria</dt>
              <dd>{info.expediente}</dd>
            </>
          )}
          {info.instagram && (
            <>
              <dt>Instagram</dt>
              <dd>@{info.instagram}</dd>
            </>
          )}
          {info.ano_fundacao && (
            <>
              <dt>Fundação</dt>
              <dd>{info.ano_fundacao}</dd>
            </>
          )}
          {info.administrador_paroquial && (
            <>
              <dt>Administrador paroquial</dt>
              <dd>{info.administrador_paroquial}</dd>
            </>
          )}
        </dl>
      </div>

      {info.conteudo && <div className="conteudo">{info.conteudo}</div>}
    </div>
  );
}
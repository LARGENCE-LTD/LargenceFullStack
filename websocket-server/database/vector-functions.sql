-- Vector similarity search function for document templates
CREATE OR REPLACE FUNCTION match_document_templates(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  template_id UUID,
  similarity_score FLOAT,
  content TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dte.template_id,
    1 - (dte.embedding <=> query_embedding) AS similarity_score,
    dte.content
  FROM public.document_template_embeddings dte
  WHERE 1 - (dte.embedding <=> query_embedding) > match_threshold
  ORDER BY dte.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get template with highest similarity
CREATE OR REPLACE FUNCTION get_best_template_match(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  template_id UUID,
  similarity_score FLOAT,
  content TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dte.template_id,
    1 - (dte.embedding <=> query_embedding) AS similarity_score,
    dte.content
  FROM public.document_template_embeddings dte
  WHERE 1 - (dte.embedding <=> query_embedding) > match_threshold
  ORDER BY dte.embedding <=> query_embedding
  LIMIT 1;
END;
$$; 
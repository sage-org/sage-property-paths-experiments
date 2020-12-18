# GMark

rule gmark_run_sage_ptc:
    output:
        'output/gmark/sage_ptc.csv'
    shell:
        'node ./scripts/sage-ptc.js http://localhost:8080/sparql http://example.org/datasets/hdt/shop10M {output} -w ./scripts/ptc-client/gmark_queries.json --timeout 1800'

rule gmark_run_sage_client_ptc:
    output:
        'output/gmark/sage_client_ptc.csv'
    shell:
        'node ./scripts/sage-client-ptc.js http://localhost:8080/sparql http://example.org/datasets/hdt/shop10M {output} -w ./scripts/ptc-client/gmark_queries.json --timeout 1800'

rule gmark_run_sage_client_multi:
    output:
        'output/gmark/sage_client_multi.csv'
    shell:
        'node ./scripts/query-sage.js http://localhost:8080/sparql http://example.org/datasets/hdt/shop10M {output} -d ./queries/gmark --method multi --timeout 1800'

rule gmark_run_virtuoso:
    output:
        'output/gmark/virtuoso.csv'
    shell:
        'python ./scripts/query-endpoint.py virtuoso http://localhost:8890/sparql http://example.org/datasets/shop10M {output} -d ./queries/gmark --timeout 1800'

rule gmark_run_fuseki:
    output:
        'output/gmark/fuseki.csv'
    shell:
        'python ./scripts/query-endpoint.py fuseki http://localhost:8890/sparql http://example.org/datasets/shop10M {output} -d ./queries/gmark --timeout 1800'

rule gmark_quantum_impact:
    input:
        ancient('output/gmark/sage_ptc_60sec.csv'),
        ancient('output/gmark/sage_ptc_10sec.csv'),
        ancient('output/gmark/sage_ptc_1sec.csv')
    output:
        'output/gmark/quantum_impact.csv'
    shell:
        'bash ./scripts/merge_csv.sh {input} > {output}'

rule gmark_tpc_client_k_impact:
    input:
        ancient('output/gmark/sage_client_ptc_2.csv'),
        ancient('output/gmark/sage_client_ptc_5.csv'),
        ancient('output/gmark/sage_client_ptc_10.csv')
    output:
        'output/gmark/quantum_impact.csv'
    shell:
        'bash ./scripts/merge_csv.sh {input} > {output}'

rule gmark_approaches_comparison:
    input:
        ancient('output/gmark/sage_ptc_60sec.csv'),
        ancient('output/gmark/sage_client_ptc_5.csv'),
        ancient('output/gmark/fuseki.csv'),
        ancient('output/gmark/virtuoso.csv')
    output:
        'output/gmark/approaches_comparison.csv'
    shell:
        'bash ./scripts/merge_csv.sh {input} > {output}'

# Wikidata

rule wikidata_run_sage_ptc:
    output:
        'output/wikidata/sage_ptc.csv'
    shell:
        'node ./scripts/sage-ptc.js http://localhost:8080/sparql http://example.org/datasets/hdt/wikidata {output} -d ./queries/wikidata --timeout 1800'

rule wikidata_run_sage_client_ptc:
    output:
        'output/wikidata/sage_client_ptc.csv'
    shell:
        'node ./scripts/sage-client-ptc.js http://localhost:8080/sparql http://example.org/datasets/hdt/wikidata {output} --workload Wikidata --timeout 1800'

rule wikidata_run_sage_client_multi:
    output:
        'output/wikidata/sage_client_multi.csv'
    shell:
        'node ./scripts/query-sage.js http://localhost:8080/sparql http://example.org/datasets/hdt/wikidata {output} -d ./queries/wikidata --method multi --timeout 1800'

rule wikidata_run_fuseki:
    output:
        'output/wikidata/fuseki.csv'
    shell:
        'python ./scripts/query-endpoint.py fuseki http://localhost:8890/sparql http://example.org/datasets/wikidata {output} -d ./queries/wikidata --timeout 1800'

rule wikidata_approaches_comparison:
    input:
        ancient('output/wikidata/sage_ptc_60sec.csv'),
        ancient('output/wikidata/sage_client_ptc_5.csv'),
        ancient('output/wikidata/fuseki.csv')
    output:
        'output/wikidata/approaches_comparison.csv'
    shell:
        'bash ./scripts/merge_csv.sh {input} > {output}'
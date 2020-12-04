QUERIES = [
    'query_1', 
    'query_2', 
    'query_3', 
    'query_4', 
    'query_5', 
    'query_6', 
    'query_7', 
    'query_8', 
    'query_9', 
    'query_10', 
    'query_11', 
    'query_12', 
    'query_13', 
    'query_14', 
    'query_15', 
    'query_16', 
    'query_17', 
    'query_18', 
    'query_19', 
    'query_20', 
    'query_21', 
    'query_22', 
    'query_23', 
    'query_24', 
    'query_25', 
    'query_26',
    'query_27', 
    'query_28', 
    'query_29', 
    'query_30'
]

rule run_all:
    input:
        expand('queries/gmark/{query}.sparql', query=QUERIES)

rule run_sage_direct:
    input:
        ancient('queries/gmark/{query}.sparql')
    output:
        'output/gmark/sage_direct/{query}.csv'
    shell:
        'node ./scripts/query-sage.js http://localhost:8080/sparql http://example.org/datasets/hdt/shop10M {output} -f {input} --timeout 1800 --method direct'

rule merge_sage_direct_data:
    input:
        expand('output/gmark/sage_direct/{query}.csv', query=QUERIES)
    output:
        'output/gmark/sage_direct.csv'
    shell:
        'bash ./scripts/merge_csv.sh {input} > {output}'

rule run_sage_multi:
    input:
        ancient('queries/gmark/{query}.sparql')
    output:
        'output/gmark/sage_multi/{query}.csv'
    shell:
        'node scripts/query-sage.js http://localhost:8080/sparql http://example.org/datasets/hdt/shop10M {output} -f {input} --timeout 1800 --method multi'

rule merge_sage_multi_data:
    input:
        expand('output/gmark/sage_multi/{query}.csv', query=QUERIES)
    output:
        'output/gmark/sage_multi.csv'
    shell:
        'bash ./scripts/merge_csv.sh {input} > {output}'

rule run_sage_alpha:
    input:
        ancient('queries/gmark/{query}.sparql')
    output:
        'output/gmark/sage_alpha/{query}.csv'
    shell:
        'node scripts/query-sage.js http://localhost:8080/sparql http://example.org/datasets/hdt/shop10M {output} -f {input} --timeout 1800 --method alpha'

rule merge_sage_alpha_data:
    input:
        expand('output/gmark/sage_alpha/{query}.csv', query=QUERIES)
    output:
        'output/gmark/sage_alpha.csv'
    shell:
        'bash ./scripts/merge_csv.sh {input} > {output}'

rule run_virtuoso:
    input:
        ancient('queries/gmark/{query}.sparql')
    output:
        'output/gmark/virtuoso/{query}.csv'
    shell:
        'python ./scripts/query-endpoint.py virtuoso http://localhost:8890/sparql http://example.org/datasets/shop10M {output} -f {input} --timeout 1800'

rule merge_virtuoso_data:
    input:
        expand('output/gmark/virtuoso/{query}.csv', query=QUERIES)
    output:
        'output/gmark/virtuoso.csv'
    shell:
        'bash ./scripts/merge_csv.sh {input} > {output}'

rule run_jena_fuseki:
    input:
        ancient('queries/gmark/{query}.sparql')
    output:
        'output/gmark/fuseki/{query}.csv'
    shell:
        'python ./scripts/query-endpoint.py fuseki http://localhost:8890/sparql http://example.org/datasets/shop10M {output} -f {input} --timeout 1800'

rule merge_jena_fuseki_data:
    input:
        expand('output/gmark/fuseki/{query}.csv', query=QUERIES)
    output:
        'output/gmark/fuseki.csv'
    shell:
        'bash ./scripts/merge_csv.sh {input} > {output}'

rule merge_approaches_data:
    input:
        expand('output/gmark/{approach}.csv', approach=['fuseki', 'virtuoso', 'sage_alpha', 'sage_multi', 'sage_direct'])
    output:
        'output/gmark/data.csv'
    shell:
        'bash ./scripts/merge_csv.sh {input} > {output}'

rule plot_metrics:
    input:
        'output/gmark/data.csv'
    output:
        'output/gmark/data_transfer.png',
        'output/gmark/execution_time.png',
        'output/gmark/http_calls.png'
    shell:
        'python ./scripts/plots.py --input {input} --output output/gmark'
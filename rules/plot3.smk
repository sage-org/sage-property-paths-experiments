####################################################################################################
####################################################################################################
########## PLOT 3: Performance on a real dataset ###################################################
####################################################################################################
####################################################################################################

####################################################################################################
# >>>>> SAGE WITH THE PTC OPERATOR AND DEPTH = 5 ###################################################
####################################################################################################

rule plot3_sage_ptc_5_run:
    input: 
        previous_run_complete=lambda wcs: [] if int(wcs.run) == 1 else [f'output/data/performance/{wcs.dataset}/SaGe-PTC-5/{int(wcs.run) - 1}/all.csv'],
        graph=ancient('graphs/{dataset}.nt'),
        query=ancient('queries/{dataset}/ptc/query_{query}.json')
    output:
        stats='output/data/performance/{dataset}/SaGe-PTC-5/{run}/query_{query}.csv',
        result='output/data/performance/{dataset}/SaGe-PTC-5/{run}/query_{query}.xml'
    params:
        port=lambda wcs: config["information"]["ports"]['sage-k5-60sec']
    shell:
        'node clients/sage-ptc/bin/interface.js http://localhost:{params.port}/sparql http://localhost:{params.port}/sparql/{wildcards.dataset} --file {input.query} --measure {output.stats} --output {output.result}; '

####################################################################################################
# >>>>> SAGE WITH THE PTC OPERATOR AND DEPTH = 20 ###################################################
####################################################################################################

rule plot3_sage_ptc_20_run:
    input: 
        previous_run_complete=lambda wcs: [] if int(wcs.run) == 1 else [f'output/data/performance/{wcs.dataset}/SaGe-PTC-20/{int(wcs.run) - 1}/all.csv'],
        graph=ancient('graphs/{dataset}.nt'),
        query=ancient('queries/{dataset}/ptc/query_{query}.json')
    output:
        stats='output/data/performance/{dataset}/SaGe-PTC-20/{run}/query_{query}.csv',
        result='output/data/performance/{dataset}/SaGe-PTC-20/{run}/query_{query}.xml'
    params:
        port=lambda wcs: config["information"]["ports"]['sage-k20-60sec']
    shell:
        'node clients/sage-ptc/bin/interface.js http://localhost:{params.port}/sparql http://localhost:{params.port}/sparql/{wildcards.dataset} --file {input.query} --measure {output.stats} --output {output.result}; '

####################################################################################################
# >>>>> SAGE WITH THE MULTI-PREDICATE AUTOMATON APPROACH ###########################################
####################################################################################################

rule plot3_sage_multi_run:
    input: 
        previous_run_complete=lambda wcs: [] if int(wcs.run) == 1 else [f'output/data/performance/{wcs.dataset}/SaGe-Multi/{int(wcs.run) - 1}/all.csv'],
        graph=ancient('graphs/{dataset}.nt'),
        query=ancient('queries/{dataset}/original/query_{query}.sparql')
    output:
        stats='output/data/performance/{dataset}/SaGe-Multi/{run}/query_{query}.csv',
        result='output/data/performance/{dataset}/SaGe-Multi/{run}/query_{query}.xml'
    params:
        port=lambda wcs: config["information"]["ports"]['sage-k20-60sec']
    shell:
        'node clients/sage-multi/bin/interface.js http://localhost:{params.port}/sparql http://localhost:{params.port}/sparql/{wildcards.dataset} --file {input.query} --measure {output.stats} --output {output.result}; '

####################################################################################################
# >>>>> VIRTUOSO ###################################################################################
####################################################################################################

rule plot3_virtuoso_run:
    input: 
        previous_run_complete=lambda wcs: [] if int(wcs.run) == 1 else [f'output/data/performance/{wcs.dataset}/Virtuoso/{int(wcs.run) - 1}/all.csv'],
        graph=ancient('graphs/{dataset}.nt'),
        query=ancient('queries/{dataset}/original/query_{query}.sparql')
    output:
        stats='output/data/performance/{dataset}/Virtuoso/{run}/query_{query}.csv',
        result='output/data/performance/{dataset}/Virtuoso/{run}/query_{query}.xml'
    params:
        port=lambda wcs: config["information"]["ports"]['virtuoso']
    shell:
        'python clients/endpoints/interface.py virtuoso http://localhost:{params.port}/sparql http://example.org/datasets/{wildcards.dataset} --file {input.query} --measure {output.stats} --output {output.result}; '

####################################################################################################
# >>>>> JENA FUSEKI ################################################################################
####################################################################################################

rule plot3_jena_run:
    input: 
        previous_run_complete=lambda wcs: [] if int(wcs.run) == 1 else [f'output/data/performance/{wcs.dataset}/Jena-Fuseki/{int(wcs.run) - 1}/all.csv'],
        graph=ancient('graphs/{dataset}.nt'),
        query=ancient('queries/{dataset}/original/query_{query}.sparql')
    output:
        stats='output/data/performance/{dataset}/Jena-Fuseki/{run}/query_{query}.csv',
        result='output/data/performance/{dataset}/Jena-Fuseki/{run}/query_{query}.xml'
    params:
        port=lambda wcs: config["information"]["ports"]['fuseki']
    shell:
        'python clients/endpoints/interface.py fuseki http://localhost:{params.port}/{wildcards.dataset} --file {input.query} --measure {output.stats} --format xml --output {output.result}'

####################################################################################################
# >>>>> PREPARE CSV FILES TO BUILD PLOTS ###########################################################
####################################################################################################

rule plot3_format_query_file:
    input:
        ancient('output/data/performance/{dataset}/{approach}/{run}/query_{query}.csv')
    output:
        'output/data/performance/{dataset}/{approach}/{run}/mergeable_query_{query}.csv'
    shell:
        'touch {output}; '
        'echo "approach,dataset,query,execution_time,nb_calls,data_transfer,data_transfer_approach_overhead,data_transfer_duplicates_overhead,nb_solutions,nb_duplicates,state" >> {output}; '
        'echo -n "{wildcards.approach},{wildcards.dataset},Q{wildcards.query}," >> {output}; '
        'cat {input} >> {output}; '
        'echo "" >> {output};'


rule plot3_merge_query_files:
    input:
        expand('output/data/performance/{{dataset}}/{{approach}}/{{run}}/mergeable_query_{query}.csv', 
            query=config["settings"]["plot3"]["settings"]["queries"])
    output:
        'output/data/performance/{dataset}/{approach}/{run}/all.csv'
    shell:
        'bash scripts/merge_csv.sh {input} > {output}'


rule plot3_compute_average:
    input:
        expand('output/data/performance/{{dataset}}/{{approach}}/{run}/all.csv', 
            run=[x for x in range(1, last_run(3) + 1)])
    output:
        'output/data/performance/{dataset}/{approach}/data.csv'
    params:
        files=lambda wcs: [f'output/data/performance/{wcs.dataset}/{wcs.approach}/{run}/all.csv' for run in range(first_run(3), last_run(3) + 1)]
    shell:
        'python scripts/average.py {output} "approach,dataset,query" {params.files}'


rule plot3_merge_all_approaches:
    input:
        expand('output/data/performance/{{dataset}}/{approach}/data.csv', 
            approach=config["settings"]["plot3"]["settings"]["approaches"])
    output:
        'output/data/performance/{dataset}/data.csv'
    shell:
        'bash scripts/merge_csv.sh {input} > {output}'


rule build_plot3:
    input:
        ancient('output/data/performance/{dataset}/data.csv')
    output:
        'output/figures/performance/{dataset}/nb_calls.png',
        'output/figures/performance/{dataset}/data_transfer.png',
        'output/figures/performance/{dataset}/execution_time.png'
    shell:
        'python scripts/performance_comparison.py --input {input} --output {output}'
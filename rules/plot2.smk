####################################################################################################
####################################################################################################
########## PLOT 2: Impact of the quantum ###########################################################
####################################################################################################
####################################################################################################

####################################################################################################
# >>>>> SAGE WITH THE PTC OPERATOR #################################################################
####################################################################################################

rule plot2_sage_agg_run:
    input: 
        previous_run_complete=lambda wcs: [] if int(wcs.run) == 1 else [f'output/data/quantum-impacts/{wcs.dataset}/{wcs.quantum}/{int(wcs.run) - 1}/all.csv'],
        graph=ancient('graphs/{dataset}.hdt'),
        query=ancient('queries/{dataset}/ptc/query_{query}.json')
    output:
        stats='output/data/quantum-impacts/{dataset}/{quantum}/{run}/query_{query}.csv',
        result='output/data/quantum-impacts/{dataset}/{quantum}/{run}/query_{query}.xml'
    params:
        port=lambda wcs: config["information"]["ports"][f'sage-k20-{wcs.quantum}']
    shell:
        'node clients/sage-ptc/bin/interface.js http://localhost:{params.port}/sparql http://localhost:{params.port}/sparql/{wildcards.dataset} --file {input.query} --measure {output.stats} --output {output.result}; '

####################################################################################################
# >>>>> PREPARE CSV FILES TO BUILD PLOTS ###########################################################
####################################################################################################

rule plot2_format_query_file:
    input:
        ancient('output/data/quantum-impacts/{dataset}/{quantum}/{run}/query_{query}.csv')
    output:
        'output/data/quantum-impacts/{dataset}/{quantum}/{run}/mergeable_query_{query}.csv'
    params:
        approach=lambda wcs: f'SaGe-PTC-{wcs.quantum}'
    shell:
        'touch {output}; '
        'echo "approach,dataset,quantum,query,execution_time,nb_calls,data_transfer,nb_solutions,state,cost_solutions,cost_control_tuples,nb_duplicates" >> {output}; '
        'echo -n "{params.approach},{wildcards.dataset},{wildcards.quantum},Q{wildcards.query}," >> {output}; '
        'cat {input} >> {output}; '
        'echo "" >> {output};'


rule plot2_merge_query_files:
    input:
        expand('output/data/quantum-impacts/{{dataset}}/{{quantum}}/{{run}}/mergeable_query_{query}.csv', 
            query=config["settings"]["plot2"]["settings"]["queries"])
    output:
        'output/data/quantum-impacts/{dataset}/{quantum}/{run}/all.csv'
    shell:
        'bash scripts/merge_csv.sh {input} > {output}'


rule plot2_compute_average:
    input:
        expand('output/data/quantum-impacts/{{dataset}}/{{quantum}}/{run}/all.csv', 
            run=[x for x in range(1, last_run(2) + 1)])
    output:
        'output/data/quantum-impacts/{dataset}/{quantum}/data.csv'
    params:
        files=lambda wcs: [f'output/data/quantum-impacts/{wcs.dataset}/{wcs.quantum}/{run}/all.csv' for run in range(first_run(2), last_run(2) + 1)]
    shell:
        'python scripts/average.py {output} "dataset,quantum,query" {params.files}'


rule plot2_merge_all_queries:
    input:
        expand('output/data/quantum-impacts/{{dataset}}/{quantum}/data.csv', 
            quantum=config["settings"]["plot2"]["settings"]["quantums"])
    output:
        'output/data/quantum-impacts/{dataset}/data.csv'
    shell:
        'bash scripts/merge_csv.sh {input} > {output}'


rule build_plot2:
    input:
        ancient('output/data/quantum-impacts/{dataset}/data.csv')
    output:
        'output/figures/quantum-impacts/{dataset}/figure.png'
    shell:
        'python scripts/parameters_impact.py --input {input} --output output/figures/quantum-impacts/{dataset}'
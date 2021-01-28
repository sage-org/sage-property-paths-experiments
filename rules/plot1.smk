####################################################################################################
####################################################################################################
########## PLOT 1: Impact of the depth ###########################################################
####################################################################################################
####################################################################################################

####################################################################################################
# >>>>> SAGE WITH THE PTC OPERATOR #################################################################
####################################################################################################

rule plot1_sage_agg_run:
    input: 
        previous_run_complete=lambda wcs: [] if int(wcs.run) == 1 else [f'output/data/depth-impacts/{wcs.dataset}/{wcs.depth}/{int(wcs.run) - 1}/all.csv'],
        graph=ancient('graphs/{dataset}.hdt'),
        query=ancient('queries/{dataset}/ptc/query_{query}.json')
    output:
        stats='output/data/depth-impacts/{dataset}/{depth}/{run}/query_{query}.csv',
        result='output/data/depth-impacts/{dataset}/{depth}/{run}/query_{query}.xml'
    params:
        port=lambda wcs: config["information"]["ports"][f'sage-k{wcs.depth}-60sec']
    shell:
        'node clients/sage-ptc/bin/interface.js http://localhost:{params.port}/sparql http://localhost:{params.port}/sparql/{wildcards.dataset} --file {input.query} --measure {output.stats} --output {output.result}; '

####################################################################################################
# >>>>> PREPARE CSV FILES TO BUILD PLOTS ###########################################################
####################################################################################################

rule plot1_format_query_file:
    input:
        ancient('output/data/depth-impacts/{dataset}/{depth}/{run}/query_{query}.csv')
    output:
        'output/data/depth-impacts/{dataset}/{depth}/{run}/mergeable_query_{query}.csv'
    params:
        approach=lambda wcs: f'SaGe-PTC-{wcs.depth}'
    shell:
        'touch {output}; '
        'echo "approach,dataset,max_depth,query,execution_time,nb_calls,data_transfer,nb_solutions,state,cost_solutions,cost_control_tuples,nb_duplicates" >> {output}; '
        'echo -n "{params.approach},{wildcards.dataset},{wildcards.depth},Q{wildcards.query}," >> {output}; '
        'cat {input} >> {output}; '
        'echo "" >> {output};'


rule plot1_merge_query_files:
    input:
        expand('output/data/depth-impacts/{{dataset}}/{{depth}}/{{run}}/mergeable_query_{query}.csv', 
            query=config["settings"]["plot1"]["settings"]["queries"])
    output:
        'output/data/depth-impacts/{dataset}/{depth}/{run}/all.csv'
    shell:
        'bash scripts/merge_csv.sh {input} > {output}'


rule plot1_compute_average:
    input:
        expand('output/data/depth-impacts/{{dataset}}/{{depth}}/{run}/all.csv', 
            run=[x for x in range(1, last_run(1) + 1)])
    output:
        'output/data/depth-impacts/{dataset}/{depth}/data.csv'
    params:
        files=lambda wcs: [f'output/data/depth-impacts/{wcs.dataset}/{wcs.depth}/{run}/all.csv' for run in range(first_run(1), last_run(1) + 1)]
    shell:
        'python scripts/average.py {output} "dataset,depth,query" {params.files}'


rule plot1_merge_all_queries:
    input:
        expand('output/data/depth-impacts/{{dataset}}/{depth}/data.csv', 
            depth=config["settings"]["plot1"]["settings"]["depths"])
    output:
        'output/data/depth-impacts/{dataset}/data.csv'
    shell:
        'bash scripts/merge_csv.sh {input} > {output}'


rule build_plot1:
    input:
        ancient('output/data/depth-impacts/{dataset}/data.csv')
    output:
        'output/figures/depth-impacts/{dataset}/figure.png'
    shell:
        'python scripts/parameters_impact.py --input {input} --output output/figures/depth-impacts/{dataset}'
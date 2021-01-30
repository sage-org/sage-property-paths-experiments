import click, sys, json, time, os, math
from SPARQLWrapper import SPARQLWrapper, JSON


def execute(server_url, default_graph_iri, query, timeout):
    sparql_wrapper = SPARQLWrapper(server_url)
    # sparql_wrapper.addDefaultGraph(default_graph_iri)
    sparql_wrapper.setQuery(query)
    sparql_wrapper.setReturnFormat(JSON)
    if timeout is not None:
        sparql_wrapper.setTimeout(timeout)
    try:
        start_time = time.time()
        result = sparql_wrapper.query().convert()
        end_time = time.time()

        execution_time = end_time - start_time
        data_transfer = sys.getsizeof(json.dumps(result))
        nb_solutions = len(result["results"]["bindings"])

        return (result, (execution_time, 1, data_transfer, 0, 0, nb_solutions, 0, 'complete')) 
    except Exception as error:
        end_time = time.time()
        execution_time = end_time - start_time
        if str(error) == 'timed out':
            return ({}, (execution_time, 1, 0, 0, 0, 0, 0, 'timeout'))
        else:
            print(error)
            return ({}, (execution_time, 1, 0, 0, 0, 0, 0, 'error'))
    

@click.group()
def cli():
    pass

@cli.command()
@click.argument("server_url", type=str)
@click.argument("default_graph_iri", type=str)
@click.option('--measure', '-m', type=click.Path(False))
@click.option('--output', '-o', type=click.Path(False))
@click.option('--query', '-q', type=str)
@click.option('--file', '-f', type=click.Path(True, True, False))
@click.option('--timeout', '-t', type=int)
def virtuoso(server_url, default_graph_iri, measure, output, query, file, timeout):
    if query is not None:
        (solutions, (statistics)) = execute(server_url, default_graph_iri, query, timeout)
    elif file is not None:
        query = open(file, 'r').read()
        (solutions, statistics) = execute(server_url, default_graph_iri, query, timeout)
    else:
        print('Error: you must specify a SPARQL query to execute.\nSee interface.py virtuoso --help for more details.')

    if output is not None:
        with open(output, 'w') as output_file:
            output_file.write(json.dumps(solutions))

    (execution_time, nb_calls, data_transfer, data_transfer_approach_overhead, data_transfer_duplicates_overhead, nb_solutions, nb_duplicates, state) = statistics
    
    if measure is not None:    
        with open(measure, 'w') as statistics_file:
            statistics_file.write((
                f'{execution_time},'
                f'{nb_calls},'
                f'{data_transfer},'
                f'{data_transfer_approach_overhead},'
                f'{data_transfer_duplicates_overhead},'
                f'{nb_solutions},'
                f'{nb_duplicates},'
                f'{state}'
            ))

    print((
        'Execution complete !\n'
        f'\t- time: {execution_time} sec\n'
        f'\t- calls: {nb_calls} http requests\n'
        f'\t- transfer: {data_transfer} bytes\n'
        f'\t\t- approach overhead: {data_transfer_approach_overhead} bytes\n'
        f'\t\t- duplicates overhead: {data_transfer_duplicates_overhead} bytes\n'
        f'\t- solutions: {nb_solutions} solution mappings\n'
        f'\t\t- duplicates: {nb_duplicates}\n'
    ))

@cli.command()
@click.argument("server_url", type=str)
@click.argument("default_graph_iri", type=str)
@click.option('--measure', '-m', type=click.Path(False))
@click.option('--output', '-o', type=click.Path(False))
@click.option('--query', '-q', type=str)
@click.option('--file', '-f', type=click.Path(True, True, False))
@click.option('--timeout', '-t', type=int)
def fuseki(server_url, default_graph_iri, measure, output, query, file, timeout):
    if query is not None:
        (solutions, (statistics)) = execute(server_url, default_graph_iri, query, timeout)
    elif file is not None:
        query = open(file, 'r').read()
        (solutions, statistics) = execute(server_url, default_graph_iri, query, timeout)
    else:
        print('Error: you must specify a SPARQL query to execute.\nSee interface.py fuseki --help for more details.')

    if output is not None:
        with open(output, 'w') as output_file:
            output_file.write(json.dumps(solutions))
    
    (execution_time, nb_calls, data_transfer, data_transfer_approach_overhead, data_transfer_duplicates_overhead, nb_solutions, nb_duplicates, state) = statistics

    if measure is not None:    
        with open(measure, 'w') as statistics_file:
            statistics_file.write((
                f'{execution_time},'
                f'{nb_calls},'
                f'{data_transfer},'
                f'{data_transfer_approach_overhead},'
                f'{data_transfer_duplicates_overhead},'
                f'{nb_solutions},'
                f'{nb_duplicates},'
                f'{state}'
            ))

    print((
        'Execution complete !\n'
        f'\t- time: {execution_time} sec\n'
        f'\t- calls: {nb_calls} http requests\n'
        f'\t- transfer: {data_transfer} bytes\n'
        f'\t\t- approach overhead: {data_transfer_approach_overhead} bytes\n'
        f'\t\t- duplicates overhead: {data_transfer_duplicates_overhead} bytes\n'
        f'\t- solutions: {nb_solutions} solution mappings\n'
        f'\t\t- duplicates: {nb_duplicates}\n'
    ))

if __name__ == "__main__":
    cli()
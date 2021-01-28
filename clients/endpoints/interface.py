import click, sys, json, time, os, math
from SPARQLWrapper import SPARQLWrapper, JSON


def execute(server_url, default_graph_iri, query, timeout, print_solution):
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
        nb_solutions = len(results["results"]["bindings"])

        return (result, (execution_time, 1, data_transfer, nb_solutions, 'complete')) 
    except Exception as error:
        end_time = time.time()
        execution_time = end_time - start_time
        if str(error) == 'timed out':
            return ({}, (execution_time, 1, 0, 0, 'timeout'))
        else:
            return ({}, (execution_time, 1, 0, 0, 'error'))
    

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
@click.option('--display', '-p', default=False)
def virtuoso(server_url, default_graph_iri, measure, output, query, file, timeout, display):
    if query is not None:
        (solutions, (statistics)) = execute(server_url, default_graph_iri, query, timeout, display)
    elif file is not None:
        query = open(file, 'r').read()
        (solutions, statistics) = execute(server_url, default_graph_iri, query, timeout, display)
    else:
        print('Error: you must specify a SPARQL query to execute.\nSee interface.py virtuoso --help for more details.')

    if output is not None:
        with open(output, 'w') as output_file:
            output_file.write(json.dumps(solutions))
    
    if measure is not None:
        (execution_time, nb_calls, data_transfer, nb_solutions, state) = statistics
        with open(measure, 'w') as statistics_file:
            statistics_file.write(f'{execution_time},{nb_calls},{data_transfer},{nb_solutions},{state}')  

@cli.command()
@click.argument("server_url", type=str)
@click.argument("default_graph_iri", type=str)
@click.option('--measure', '-m', type=click.Path(False))
@click.option('--output', '-o', type=click.Path(False))
@click.option('--query', '-q', type=str)
@click.option('--file', '-f', type=click.Path(True, True, False))
@click.option('--timeout', '-t', type=int)
@click.option('--display', '-p', default=False)
def fuseki(server_url, default_graph_iri, measure, output, query, file, timeout, display):
    if query is not None:
        (solutions, (statistics)) = execute(server_url, default_graph_iri, query, timeout, display)
    elif file is not None:
        query = open(file, 'r').read()
        (solutions, statistics) = execute(server_url, default_graph_iri, query, timeout, display)
    else:
        print('Error: you must specify a SPARQL query to execute.\nSee interface.py fuseki --help for more details.')

    if output is not None:
        with open(output, 'w') as output_file:
            output_file.write(json.dumps(solutions))
    
    if measure is not None:
        (execution_time, nb_calls, data_transfer, nb_solutions, state) = statistics
        with open(measure, 'w') as statistics_file:
            statistics_file.write(f'{execution_time},{nb_calls},{data_transfer},{nb_solutions},{state}')

if __name__ == "__main__":
    cli()
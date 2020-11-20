import click, sys, json, time, os, math
from SPARQLWrapper import SPARQLWrapper, JSON

def execute(server_url, default_graph_iri, query, timeout):
    sparql_wrapper = SPARQLWrapper(server_url)
    sparql_wrapper.addDefaultGraph(default_graph_iri)
    sparql_wrapper.setQuery(query)
    sparql_wrapper.setReturnFormat(JSON)
    if timeout is not None:
        sparql_wrapper.setTimeout(timeout)
    try:
        start_time = time.time()
        results = sparql_wrapper.query()
        end_time = time.time()
        
        results = results.convert()
        bindings = []
        for result in results["results"]["bindings"]:
            solution = {}
            for key in result:
                solution[key] = result[key]["value"]
            bindings.append(solution)
        execution_time = end_time - start_time
        data_transfer = sys.getsizeof(json.dumps(bindings))
        nb_results = len(bindings)
        return (execution_time, 1, data_transfer, nb_results, 'complete')
    except Exception as error:
        end_time = time.time()
        execution_time = end_time - start_time
        if str(error) == 'timed out':
            return (execution_time, 1, 0, 0, 'timeout')
        else:
            return (execution_time, 1, 0, 0, 'error')
    
def basename(file):
    base = os.path.basename(file)
    return os.path.splitext(base)[0]

def extract_queries_from_files(files):
    queries = []
    for file in files:
        with open(file, 'r') as query_file:
            name = basename(file)
            query = query_file.read()
            queries.append({'name': name, 'value': query})
    return queries

def extract_queries_from_arguments(arguments):
    queries = []
    for index, query in enumerate(arguments):
        name = f'cli_query_{index}'
        queries.append({'name': name, 'value': query})
    return queries

def init_statistics(queries):
    statistics = {}
    for query in queries:
        query_name = query['name']
        statistics[query_name] = {
            'execution_time': [], 
            'http_calls': [],
            'data_transfer': [],
            'nb_results': [],
            'state': 'complete'
        }
    return statistics

def compute_average(values):
    return sum(values) / len(values)

def compute_averages(statistics):
    for query in statistics.keys():
        statistics[query]['execution_time'] = compute_average(statistics[query]['execution_time'])
        statistics[query]['http_calls'] = compute_average(statistics[query]['http_calls'])
        statistics[query]['data_transfer'] = compute_average(statistics[query]['data_transfer'])
        statistics[query]['nb_results'] = compute_average(statistics[query]['nb_results'])

def write_statistics(statistics, endpoint, output):
    data = 'query,approach,execution_time,http_calls,data_transfer,nb_results,state\n'
    for query in statistics.keys():
        execution_time = statistics[query]['execution_time']
        http_calls = statistics[query]['http_calls']
        data_transfer = statistics[query]['data_transfer']
        nb_results = statistics[query]['nb_results']
        state = statistics[query]['state']
        data += f'{query},{endpoint},{execution_time},{http_calls},{data_transfer},{nb_results},{state}\n'
    with open(output, 'w') as output_file:
        output_file.write(data)


def execute_queries(endpoint, server_url, default_graph_iri, queries, timeout, nb_iterations, warm_up, output):
    statistics = init_statistics(queries)
    for iteration in range(0, nb_iterations):
        for query in queries:
            query_name = query['name']
            query_value = query['value']
            (execution_time, http_calls, data_transfer, nb_results, state) = execute(server_url, default_graph_iri, query_value, timeout)
            if (not warm_up or iteration > 0) and (statistics[query_name]['state'] == 'complete'):
                statistics[query_name]['execution_time'].append(execution_time)
                statistics[query_name]['http_calls'].append(http_calls)
                statistics[query_name]['data_transfer'].append(data_transfer)
                statistics[query_name]['nb_results'].append(nb_results)
                statistics[query_name]['state'] = state
    compute_averages(statistics)
    write_statistics(statistics, endpoint, output)

@click.group()
def cli():
    pass

@cli.command()
@click.argument("server_url", type=str)
@click.argument("default_graph_iri", type=str)
@click.argument("output", type=str)
@click.option('--query', '-q', multiple=str, type=str)
@click.option('--file', '-f', multiple=str, type=click.Path(True))
@click.option('--timeout', '-t', type=int)
@click.option('--times', '-n', type=int, default=1)
@click.option('--warmup', '-w', default=False)
def virtuoso(server_url, default_graph_iri, output, query, file, timeout, times, warmup):
    queries = extract_queries_from_arguments(query)
    queries += extract_queries_from_files(file)
    execute_queries('Virtuoso', server_url, default_graph_iri, queries, timeout, times, warmup, output)    

@cli.command()
@click.argument("server_url", type=str)
@click.argument("default_graph_iri", type=str)
@click.argument("output", type=str)
@click.option('--query', '-q', multiple=str, type=str)
@click.option('--file', '-f', multiple=str, type=click.Path(True))
@click.option('--timeout', '-t', type=int)
@click.option('--times', '-n', type=int, default=1)
@click.option('--warmup', '-w', default=False)
def fuseki(server_url, default_graph_iri, output, query, file, timeout, times, warmup):
    queries = extract_queries_from_arguments(query)
    queries += extract_queries_from_files(file)
    execute_queries('Jena Fuseki', server_url, default_graph_iri, queries, timeout, times, warmup, output)

if __name__ == "__main__":
    cli()
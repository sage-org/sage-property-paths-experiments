# Processing SPARQL Property Path Queries Online with Web Preemption

**Paper submission date**: 18 December 2020

**Authors:** Julien Aimonier-Davat (LS2N), Hala Skaf-Molli (LS2N), and Pascal Molli (LS2N)

**Abstract** 
SPARQL property path queries provide a succinct way to
write complex navigational queries over RDF knowledge graphs. However, 
the evaluation of these queries over online knowledge graphs such
as DBPedia or Wikidata is often interrupted by quotas, returning no 
results or partial results. To ensure complete results, property path queries
are evaluated client-side. Smart clients decompose property path queries
into subqueries for which complete results are ensured. The granularity
of the decomposition depend on the expressivity of the server. Whatever
the decomposition, it could generate a high number of subqueries, a large
data transfer, and finally delivers poor performances. In this paper, we
extend a preemptable SPARQL server with a partial transitive closure
operator (PTC) based on a depth limited search algorithm. We show
that a smart client using the PTC operator is able to process SPARQL
property path online and deliver complete results. Experimental results
demonstrate that our approach outperforms existing smart client solutions 
in terms of HTTP calls, data transfer and query execution time.

# Experimental results

## Dataset and Queries

In our experiments, we use the [gMark](https://hal.inria.fr/hal-01402575) framework, 
which is a framework designed to generate synthetic graph instances coupled with 
complex property path query workloads. We generate a graph instance having 7,533,145 edges and
30 queries for the "Shop" gMark scenario. All our queries contain from one to four
transitive path expressions.

## Machine configuration on GCP (Google Cloud Platform)

- type: `c2-standard-4 :4 vCPU, 15 Go of memory`
- processor platform: `Intel Broadwell`
- OS:  ubuntu-1910-eoan-v20191114
- SSD disk of 256GB

## Plots

**Plot 1 legend**: Statistics about the evaluation of the gmark queries in terms of execution time, data transfer
and number of http calls for different time quantum.

![](output/figures/quantum-impacts/gmark/figure.png?raw=true)

**Plot 2 legend**: Statistics about the evaluation of the gmark queries in terms of execution time, data transfer
and number of http calls for different MaxDepth value.

![](output/figures/depth-impacts/gmark/figure.png?raw=true)

**Plot 3 legend**: Execution time, data transfer and number of http calls for the gmark queries

![](output/figures/performance/gmark/execution_time.png?raw=true)
![](output/figures/performance/gmark/data_transfer.png?raw=true)
![](output/figures/performance/gmark/http_calls.png?raw=true)

# Experimental study

## Dependencies Installation

To run our experiments, the following softwares and packages have to be installed on your system.
* [Virtuoso](https://github.com/openlink/virtuoso-opensource/releases/tag/v7.2.5) (v7.2.5)
* [NodeJS](https://nodejs.org/en/) (v14.15.4)
* [Python3.7]() and [Python3.7-dev]()
* [Virtualenv]() (for Python3.7)

**Caution:** The default location of Virtuoso is ```/usr/local/virtuoso-opensource```. If you
change it during the installation of Virtuoso, please update the
[start_server.sh](https://github.com/JulienDavat/sage-sparql-void/blob/master/scripts/start_servers.sh) and
[stop_server.sh](https://github.com/JulienDavat/sage-sparql-void/blob/master/scripts/stop_servers.sh) scripts.

## Configuration

**Virtuoso** needs to be configured to use a single thread per query and to disable quotas.
First open the file ```${VIRTUOSO_DIRECTORY}/var/lib/virtuoso/db/virtuoso.ini``` and apply
the following changes:
- In the *SPARQL* section
    - set *ResultSetMaxRows*, *MaxQueryCostEstimationTime* and *MaxQueryExecutionTime* to **10^9** in order to disable quotas
- In the *Parameters* section
    - set *MaxQueryMem*, *NumberOfBuffers* and *MaxDirtyBuffers* to an appropriate value based on the amount of space available on your system
    - set *ThreadsPerQuery* to **1**
    - add your *home* directory to *DirsAllowed*

## Project installation

Once all dependencies have been installed, clone this repository and install the project. 

```bash
git clone https://github.com/JulienDavat/property-paths-experiments.git sage-ppaths-experiments
cd sage-ppaths-experiments
bash install.sh
```

## Datasets ingestion

All the datasets used in our experiments are available online:
- **The gmark dataset** is available in the [.hdt]() and [.nt]() formats

First, download all **.hdt** datasets into the **graphs** directory.

### Ingest data in Virtuoso

```bash
# Loading all .nt files in the graphs directory
isql "EXEC=ld_dir('${PROJECT_DIRECTORY}/graphs', '*.nt', 'http://example.org/datasets/default');"
isql "EXEC=rdf_loader_run();"
isql "EXEC=checkpoint;"
```

## Experiments configuration

All our experiments can be configured using the file [xp.json](https://github.com/JulienDavat/property-paths-experiments/blob/master/configs/xp.json).
Here you have an extract of the configuration file used to run our experiments.

```json
{
    "settings": {
        "plot1": {
            "title": "DepthMax impacts executing the gmark queries",
            "settings": {
                "depths": ["2", "3", "5", "10"],
                "dataset": "gmark",
                "queries": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
                "runs": 3,
                "warmup": false
            }
        },
        "plot2" : {
            "title": "Time quantum impacts executing the gmark queries",
            "settings": {
                "quantums": ["500ms", "1sec", "60sec"],
                "dataset": "gmark",
                "queries": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
                "runs": 3,
                "warmup": false
            }
        },
        "plot3": {
            "title": "Performance of the SaGe-PTC approach compared to Virtuoso, Jena and SaGe-Multi over the gmark dataset",
            "settings": {
                "approaches": ["SaGe-PTC-5", "SaGe-PTC-20", "Jena-Fuseki", "SaGe-Multi"],
                "dataset": "gmark",
                "queries": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
                "runs": 3,
                "warmup": false
            }
        }
    }
}
```

Configurable fields are detailed below:
- **dataset:** the dataset on which queries will be executed. 
    - accepted values: gmark
- **depths:** the differents values of the MaxDepth parameter for which queries will be executed. 
    - accepted values: 2, 3, 5, 10 and 20
- **quantums:** the different quantum times for which queries will be executed. 
    - accepted values: 500ms, 1sec, 60sec
- **queries:** the queries to execute for each workload. 
    - accepted values: 1..30 for the gmark dataset
- **warmup:** true to compute a first run for which no statistics will be recorded, false otherwise
    - accepted value: true or false
- **runs:** the number of run to compute. For each of these run, queries execution statistics will be
recorded and the average will be retained for each metric.
    - accepted value: a non-zero positive integer

## Running the experiments 

Our experimental study is powered by **Snakemake**. To run any part of our experiments, just ask snakemake for the desired output file.
For example, the main commands are given below:

```bash
# Measures the impact of the quantim time on performance using the gmark queries
snakemake --cores 1 output/figures/quantum-impacts/gmark/figure.png

# Measures the impact of the MaxDepth parameter on performance using the gmark queries
snakemake --cores 1 output/figures/depth-impacts/gmark/figure.png

# Compares the different approaches in terms of execution time, data transfer and number of http calls using the gmark queries
snakemake --cores 1 output/figures/performance/gmark/{nb_calls,data_transfer,execution_time}.png
```
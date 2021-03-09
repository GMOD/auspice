import React from "react";
import { connect } from "react-redux";
import {
  createViewState,
  createJBrowseTheme,
  JBrowseLinearGenomeView,
  ThemeProvider
} from "@jbrowse/react-linear-genome-view";

import Card from "../framework/card";

const theme = createJBrowseTheme({
  palette: {
    primary: {
      main: "#5da8a3"
    },
    secondary: {
      main: "#333"
    }
  }
});

class GenomeView extends React.Component {
  render() {
    // avoid error with rootSequence
    if (this.props.metadata.rootSequence === undefined) {
      return <></>;
    }

    const assembly = {
      name: "NC_045512.2",
      sequence: {
        type: "ReferenceSequenceTrack",
        trackId: "NC_045512.2-ReferenceSequenceTrack",
        adapter: {
          type: "FromConfigSequenceAdapter",
          features: [
            {
              refName: "NC_045512.2",
              uniqueId: "NC_045512.2",
              start: 0,
              end: this.props.metadata.rootSequence.nuc.length,
              seq: this.props.metadata.rootSequence.nuc
            }
          ]
        }
      }
    };

    const processedAnnotations = this.props.annotations.map((annotation) => {
      return {
        refName: "NC_045512.2",
        name: annotation.prot,
        uniqueId: annotation.idx,
        start: annotation.start,
        end: annotation.end,
        fill: annotation.fill
      };
    });

    const processedEntropy = this.props.bars.map((bar) => {
      return {
        refName: "NC_045512.2",
        score: Number(bar.y),
        start: bar.x,
        end: bar.x + 1,
        uniqueId: String(bar.x)
      };
    });

    const tracks = [
      {
        type: "FeatureTrack",
        name: "NC_045512.2 Annotations",
        trackId: "NC_045512.2-annotations",
        assemblyNames: ["NC_045512.2"],
        category: ["Annotation"],
        adapter: {
          type: "Gff3TabixAdapter",
          gffGzLocation: {
            uri: "https://jbrowse.org/genomes/sars-cov2/sars-cov2-annotations.sorted.gff.gz"
          },
          index: {
            location: {
              uri: "https://jbrowse.org/genomes/sars-cov2/sars-cov2-annotations.sorted.gff.gz.tbi"
            }
          }
        }
      },
      {
        type: "FeatureTrack",
        name: "Nextstrain annotations",
        trackId: "nextstrain-annotations",
        assemblyNames: ["NC_045512.2"],
        category: ["Annotation"],
        adapter: {
          type: "FromConfigAdapter",
          features: processedAnnotations
        },
        displays: [
          {
            type: "LinearBasicDisplay",
            displayId: "nextstrain-color-display",
            renderer: {
              type: "SvgFeatureRenderer",
              color1: "function(feature) { return feature.get('fill') || 'black' }"
            }
          }
        ]
      },
      {
        type: "QuantitativeTrack",
        name: "Entropy score",
        trackId: "entropy-score",
        assemblyNames: ["NC_045512.2"],
        category: ["Annotation"],
        adapter: {
          type: "FromConfigAdapter",
          features: processedEntropy
        }
      },
      {
        type: "FeatureTrack",
        name: "Spike Mutations",
        trackId: "spike-mutations",
        assemblyNames: ["NC_045512.2"],
        category: ["Annotation"],
        adapter: {
          type: "Gff3TabixAdapter",
          gffGzLocation: {
            uri: "https://jbrowse.org/genomes/sars-cov2/data/sars-cov2-spike-mutations.gff3.gz"
          },
          index: {
            location: {
              uri:
                "https://jbrowse.org/genomes/sars-cov2/data/sars-cov2-spike-mutations.gff3.gz.tbi"
            }
          }
        }
      }
    ];

    const defaultSession = {
      name: "My session",
      view: {
        id: "linearGenomeView",
        type: "LinearGenomeView",
        tracks: [
          {
            type: "FeatureTrack",
            configuration: "spike-mutations",
            displays: [
              {
                type: "LinearBasicDisplay"
              }
            ]
          },
          {
            type: "FeatureTrack",
            configuration: "NC_045512.2-annotations",
            displays: [
              {
                type: "LinearBasicDisplay"
              }
            ]
          },
          {
            type: "ReferenceSequenceTrack",
            configuration: "NC_045512.2-ReferenceSequenceTrack",
            displays: [
              {
                type: "LinearReferenceSequenceDisplay",
                configuration: "NC_045512.2-ReferenceSequenceTrack-LinearReferenceSequenceDisplay"
              }
            ]
          }
        ]
      }
    };

    const location = this.props.zoomMin
      ? `NC_045512.2:${this.props.zoomMin}..${this.props.zoomMax}`
      : "NC_045512.2:1..29,903";

    const viewState = createViewState({
      assembly,
      tracks,
      location,
      defaultSession
    });

    return (
      <Card title="Genome Browser">
        <div style={{ width: this.props.width }}>
          <ThemeProvider theme={theme}>
            <JBrowseLinearGenomeView viewState={viewState} />
          </ThemeProvider>
        </div>
      </Card>
    );
  }
}

function mapStateToProps(state) {
  return {
    annotations: state.entropy.annotations,
    geneMap: state.entropy.geneMap,
    bars: state.entropy.bars,
    zoomMin: state.entropy.zoomMin,
    zoomMax: state.entropy.zoomMax,
    geneLength: state.controls.geneLength,
    metadata: state.metadata
  };
}
export default connect(mapStateToProps)(GenomeView);

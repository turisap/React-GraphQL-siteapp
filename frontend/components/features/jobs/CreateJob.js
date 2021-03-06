import React from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import { Form } from "react-advanced-form";
import Router from "next/router";
import { CreateWithFilesUpload } from "../../abstractions/CreateWithFilesUpload";
import DisplayError from "../../ErrorMessage";
import Loading from "../../Loading";
import Input from "../../fields/Input";
import Select from "../../fields/Select";
import FileUpload from "../../fields/FileUpload";
import TextArea from "../../fields/TextArea";
import { CURRENT_PROJECTS_JOBS } from './JOBS';

const CREATE_JOB_MUTATION = gql`
  mutation CREATE_JOB_MUATION(
    $tag: ID!
    $title: String!
    $level: Float!
    $unit: String!
    $image: String
    $largeImage: String
    $assignee: ID!
    $description: String
  ) {
    createJob(
      tag: $tag
      title: $title
      level: $level
      unit: $unit
      image: $image
      largeImage: $largeImage
      assignee: $assignee
      description: $description
    ) {
      id
      title
    }
  }
`;

const ALL_TAGS_OF_JOB_GROUP_QUERY = gql`
  query ALL_TAGS_QUERY($jobGroup: String!) {
    allTagsOfJobGroup(jobGroup: $jobGroup) {
      id
      title
      jobGroup
    }
  }
`;

const ALL_PROJECT_PARTICIPANTS_QUERY = gql`
  query ALL_PROJECT_PARTICIPATNS_QUERY {
    projectParticipants {
      id
      name
      occupation {
        title
      }
    }
  }
`;


class CreateJob extends CreateWithFilesUpload {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  state = {
    jobGroup: null,
    jobCreated: false
  };

  render() {
    return (
      <Mutation
        mutation={CREATE_JOB_MUTATION}
        onCompleted={() => {
          this.setState({ jobCreated: true });
          Router.push("/jobs");
        }}
        refetchQueries={[{ query : CURRENT_PROJECTS_JOBS }]}
      >
        {(createJob, { loading, error }) => {
          if (loading) return <Loading />;
          if (error) return <DisplayError error={error} />;
          if (this.state.jobCreated)
            return <p>Job ahs been successfully created</p>;
          return (
            <Form
              action={({ serialized }) => {
                createJob({
                  variables: {
                    ...serialized,
                    title: serialized.createJob__title,
                    unit: serialized.unit__number,
                    tag: serialized.createJob__tag,
                    image: serialized.job__picture,
                    description: serialized.createJob__description
                  }
                });
                this.resetState();
              }}
              ref={this.formRef}
              className="createJob__form"
            >
              <Select
                required
                name="jobGroup"
                label="Job Group"
                onChange={e => this.setState({ jobGroup: e.nextValue })}
              >
                <option value="0">Select job group</option>
                <option value="SURVEY">SURVEY</option>
                <option value="FOUNDATION">FOUNDATION</option>
                <option value="STRUCTURAL_STEEL">STRUCTURAL STEEL</option>
                <option value="STRUCTURAL_CONCRETE">STRUCTURAL CONCRETE</option>
                <option value="FITIN">FIT IN</option>
                <option value="PLUMBING">PLUMBING</option>
                <option value="ELECTRICAL">ELECTRICAL</option>
                <option value=" HANDOVER"> HANDOVER</option>
              </Select>
              <Input
                label="Title"
                required
                type="text"
                name="createJob__title"
              />
              <Input required label="level" type="number" name="level" />
              <Input
                label="Unit number"
                required
                type="text"
                name="unit__number"
              />
              <Select required name="assignee" label="Assignee">
                <option value="0">Select Assignee</option>
                <Query query={ALL_PROJECT_PARTICIPANTS_QUERY}>
                  {({ data }) => {
                    if (
                      data.projectParticipants &&
                      !data.projectParticipants.length
                    )
                      return "";
                    return data.projectParticipants.map(participant => (
                      <option value={participant.id} key={participant.id}>
                        {`${participant.name} ${participant.occupation.title}`}
                      </option>
                    ));
                  }}
                </Query>
              </Select>
              <Select required name="createJob__tag" label="Tag">
                <option value="0">Select Tag</option>
                {this.state.jobGroup && (
                  <Query
                    query={ALL_TAGS_OF_JOB_GROUP_QUERY}
                    variables={{ jobGroup: this.state.jobGroup }}
                  >
                    {({ data }) => {
                      if (!data.allTagsOfJobGroup) return "";
                      return data.allTagsOfJobGroup.map(tag => (
                        <option value={tag.id} key={tag.id}>
                          {tag.title}
                        </option>
                      ));
                    }}
                  </Query>
                )}
              </Select>
              <TextArea
                label="Description"
                required
                name="createJob__description"
              />
              <FileUpload
                label="Job Picture"
                name="job__picture"
                required
                formRef={this.formRef}
                changeHandle={this.uploadFile}
              />
              <button type="submit">Create</button>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default CreateJob;
export { ALL_PROJECT_PARTICIPANTS_QUERY, ALL_TAGS_OF_JOB_GROUP_QUERY, CREATE_JOB_MUTATION };

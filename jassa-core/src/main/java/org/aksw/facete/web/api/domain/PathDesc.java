package org.aksw.facete.web.api.domain;


public class PathDesc {
	private ServiceDesc service;
	private ConceptDesc sourceConcept;
	private ConceptDesc targetConcept;
	
	public ServiceDesc getService() {
		return service;
	}
	public void setService(ServiceDesc service) {
		this.service = service;
	}
	public ConceptDesc getSourceConcept() {
		return sourceConcept;
	}
	public void setSourceConcept(ConceptDesc sourceConcept) {
		this.sourceConcept = sourceConcept;
	}
	public ConceptDesc getTargetConcept() {
		return targetConcept;
	}
	public void setTargetConcept(ConceptDesc targetConcept) {
		this.targetConcept = targetConcept;
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((service == null) ? 0 : service.hashCode());
		result = prime * result
				+ ((sourceConcept == null) ? 0 : sourceConcept.hashCode());
		result = prime * result
				+ ((targetConcept == null) ? 0 : targetConcept.hashCode());
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		PathDesc other = (PathDesc) obj;
		if (service == null) {
			if (other.service != null)
				return false;
		} else if (!service.equals(other.service))
			return false;
		if (sourceConcept == null) {
			if (other.sourceConcept != null)
				return false;
		} else if (!sourceConcept.equals(other.sourceConcept))
			return false;
		if (targetConcept == null) {
			if (other.targetConcept != null)
				return false;
		} else if (!targetConcept.equals(other.targetConcept))
			return false;
		return true;
	}
	@Override
	public String toString() {
		return "PathDesc [service=" + service + ", sourceConcept="
				+ sourceConcept + ", targetConcept=" + targetConcept + "]";
	}
	
	
	
}